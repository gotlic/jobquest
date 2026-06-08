import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL requise' }, { status: 400 });

  let pageContent = '';
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });
    pageContent = await response.text();
    // Strip HTML tags for cleaner content
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
  "contact_linkedin": "Profil LinkedIn recruteur si mentionné (ou null)",
  "network_connection": "Suggestion de lien réseau à activer ou personne à contacter pour ce poste (ou null)"
}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Extract the first JSON object found in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  try {
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    return NextResponse.json({ ...data, url });
  } catch {
    return NextResponse.json({ error: 'Erreur parsing IA', raw: text }, { status: 500 });
  }
}
