import { NextRequest, NextResponse } from 'next/server';

export type FeedItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  summary: string;
  pubDate: string;
  salary: string;
  contract_type: string;
  source: string;
};

// Cache in-process par clé de recherche (6h)
const cache = new Map<string, { items: FeedItem[]; at: number }>();
const TTL = 6 * 60 * 60 * 1000;

// Token France Travail (expire après 1490s ~25min)
let ftToken: { value: string; expiresAt: number } | null = null;

async function getFTToken(clientId: string, clientSecret: string): Promise<string> {
  if (ftToken && Date.now() < ftToken.expiresAt - 30000) return ftToken.value;
  const res = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'api_offresdemploiv2 o2dsoffre',
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Auth FT failed: ${res.status}`);
  const data = await res.json();
  ftToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return ftToken.value;
}

async function fetchFranceTravail(q: string, clientId: string, clientSecret: string): Promise<FeedItem[]> {
  const token = await getFTToken(clientId, clientSecret);
  const params = new URLSearchParams({
    motsCles: q,
    range: '0-49',
    sort: '1', // tri par date
  });
  const res = await fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FT API ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const offres: Record<string, unknown>[] = data.resultats ?? [];

  return offres.map(o => {
    const lieu = o.lieuTravail as Record<string, unknown> | undefined;
    const entreprise = o.entreprise as Record<string, unknown> | undefined;
    const salaire = o.salaire as Record<string, unknown> | undefined;

    return {
      id: String(o.id ?? ''),
      title: String(o.intitule ?? ''),
      company: String(entreprise?.nom ?? ''),
      location: String(lieu?.libelle ?? ''),
      url: `https://candidat.francetravail.fr/offres/emploi/detail/${o.id}`,
      summary: String(o.description ?? '').slice(0, 300),
      pubDate: String(o.dateCreation ?? ''),
      salary: String(salaire?.libelle ?? ''),
      contract_type: String(o.typeContratLibelle ?? ''),
      source: 'France Travail',
    };
  });
}

export async function GET(req: NextRequest) {
  const q           = req.nextUrl.searchParams.get('q') ?? 'ingénieur alternance';
  const force       = req.nextUrl.searchParams.get('force') === '1';
  const clientId    = req.nextUrl.searchParams.get('cid') ?? '';
  const clientSecret = req.nextUrl.searchParams.get('cs') ?? '';
  const key = `${clientId}::${q.toLowerCase().trim()}`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ items: [], error: 'NO_CREDENTIALS' });
  }

  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ items: cached.items, cachedAt: cached.at, cached: true });
  }

  try {
    const items = await fetchFranceTravail(q, clientId, clientSecret);
    cache.set(key, { items, at: Date.now() });
    return NextResponse.json({ items, cachedAt: Date.now(), cached: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[feed]', msg);
    const isAuth = msg.includes('Auth FT') || msg.includes('401');
    return NextResponse.json(
      { items: [], error: isAuth ? 'INVALID_CREDENTIALS' : msg },
      { status: isAuth ? 401 : 500 }
    );
  }
}
