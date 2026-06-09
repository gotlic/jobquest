import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';

const client = new Anthropic();

// Cache in-process (survit tant que le worker Passenger est vivant)
const urlCache = new Map<string, Record<string, unknown>>();

/** Normalise une URL pour la clé de cache (retire fragment et trailing slash) */
function cacheKey(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = '';
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

const encoder = new TextEncoder();

function sseChunk(data: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }
  const url = body?.url;
  if (!url) return NextResponse.json({ error: 'URL requise' }, { status: 400 });

  const key = cacheKey(url);

  // Helper: réponse SSE one-shot (cache)
  function sseOnce(data: Record<string, unknown>) {
    const body = new ReadableStream({
      start(ctrl) { ctrl.enqueue(sseChunk(data)); ctrl.close(); },
    });
    return new Response(body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
  }

  // 1. Cache in-process
  if (urlCache.has(key)) {
    return sseOnce({ ...urlCache.get(key), url, _cached: true, done: true });
  }

  // 2. Déjà dans la base de données ?
  try {
    const db = await getDb();
    const existing = db.prepare('SELECT * FROM jobs WHERE url = ? LIMIT 1').get(url) as Record<string, unknown> | undefined;
    if (existing) {
      const cached = {
        title: existing.title,
        company: existing.company,
        location: existing.location,
        remote: existing.remote,
        start_date: existing.start_date,
        salary: existing.salary,
        contract_type: existing.contract_type,
        summary: existing.summary,
        contact_name: existing.contact_name,
        contact_email: existing.contact_email,
        contact_linkedin: existing.contact_linkedin,
      };
      urlCache.set(key, cached);
      return sseOnce({ ...cached, url, _cached: true, done: true });
    }
  } catch (dbErr) {
    console.error('[analyze] db lookup error (non-blocking):', dbErr);
  }

  // 3. Appel IA — utilise SSE pour garder la connexion Passenger vivante
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Heartbeat immédiat pour maintenir la connexion
        controller.enqueue(sseChunk({ status: 'fetching' }));

        let pageContent = '';
        try {
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)' },
            signal: AbortSignal.timeout(10000),
          });
          pageContent = await response.text();
          pageContent = pageContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
        } catch {
          controller.enqueue(sseChunk({ error: 'Impossible de lire cette URL', done: true }));
          controller.close();
          return;
        }

        // Appel IA en streaming — les premiers tokens arrivent en ~1-2s
        // ce qui envoie immédiatement du trafic et évite le timeout Passenger
        controller.enqueue(sseChunk({ status: 'analyzing' }));

        const anthropicStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Tu analyses une offre d'emploi pour un outil de suivi de candidatures. Extrais les informations suivantes du contenu de la page et réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication.

URL: ${url}
Contenu de la page: ${pageContent}

JSON attendu:
{
  "title": "Intitulé exact du poste",
  "company": "Nom de l'entreprise",
  "location": "Ville, Pays (ou null)",
  "remote": "full / partial / no / null",
  "start_date": "Date de début si mentionnée (ou null)",
  "salary": "Fourchette salariale si mentionnée (ou null)",
  "contract_type": "CDI / CDD / Stage / Freelance / etc (ou null)",
  "summary": "Résumé du poste en 30-50 mots maximum, percutant et informatif",
  "contact_name": "Prénom Nom du recruteur si mentionné (ou null)",
  "contact_email": "Email recruteur si mentionné (ou null)",
  "contact_linkedin": "Profil LinkedIn recruteur si mentionné (ou null)"
}`,
            },
          ],
        });

        // Chaque delta de texte → heartbeat SSE (garde Passenger vivant)
        let tickCount = 0;
        anthropicStream.on('text', () => {
          tickCount++;
          // Heartbeat à chaque 5 tokens pour ne pas surcharger
          if (tickCount % 5 === 1) {
            try { controller.enqueue(sseChunk({ status: 'thinking', tick: tickCount })); } catch { /* ignore */ }
          }
        });

        const message = await anthropicStream.finalMessage();

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        try {
          const data = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
          urlCache.set(key, data);
          controller.enqueue(sseChunk({ ...data, url, done: true }));
        } catch {
          controller.enqueue(sseChunk({ error: 'Erreur parsing IA', raw: text, done: true }));
        }
      } catch (e) {
        console.error('[POST /api/analyze] error:', e);
        controller.enqueue(sseChunk({ error: 'Erreur serveur lors de l\'analyse', done: true }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // désactive le buffering nginx/apache
    },
  });
}
