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

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL requise' }, { status: 400 });

  const key = cacheKey(url);

  // 1. Cache in-process
  if (urlCache.has(key)) {
    return NextResponse.json({ ...urlCache.get(key), url, _cached: true });
  }

  // 2. Déjà dans la base de données ?
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
    return NextResponse.json({ ...cached, url, _cached: true });
  }

  // 3. Appel IA
  let pageContent = '';
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });
    pageContent = await response.text();
    pageContent = pageContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
  } catch {
    return NextResponse.json({ error: 'Impossible de lire cette URL' }, { status: 422 });
  }

  const message = await client.messages.create({
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

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  try {
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    // Mise en cache pour les prochains appels
    urlCache.set(key, data);
    return NextResponse.json({ ...data, url });
  } catch {
    return NextResponse.json({ error: 'Erreur parsing IA', raw: text }, { status: 500 });
  }
}
