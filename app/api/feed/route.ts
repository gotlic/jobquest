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

/* ── France Travail ─────────────────────────────────────────── */

// Token France Travail (expire après ~25min)
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
  const params = new URLSearchParams({ motsCles: q, range: '0-49', sort: '1' });
  const res = await fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`FT API ${res.status}`);
  const data = await res.json();
  const offres: Record<string, unknown>[] = data.resultats ?? [];

  return offres.map(o => {
    const lieu = o.lieuTravail as Record<string, unknown> | undefined;
    const entreprise = o.entreprise as Record<string, unknown> | undefined;
    const salaire = o.salaire as Record<string, unknown> | undefined;
    return {
      id: `ft-${o.id}`,
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

/* ── SerpAPI / Google Jobs ──────────────────────────────────── */

async function fetchGoogleJobs(q: string, apiKey: string): Promise<FeedItem[]> {
  const params = new URLSearchParams({
    engine: 'google_jobs',
    q,
    google_domain: 'google.fr',
    gl: 'fr',
    hl: 'fr',
    location: 'France',
    api_key: apiKey,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  if (data.error) {
    const msg = String(data.error);
    if (/invalid api key/i.test(msg)) throw new Error('SERP_AUTH');
    if (/run out of searches/i.test(msg)) throw new Error('SERP_QUOTA');
    // "hasn't returned any results" = recherche vide, pas une erreur
    if (/returned any results/i.test(msg)) return [];
    throw new Error(`SerpAPI: ${msg.slice(0, 150)}`);
  }
  const jobs: Record<string, unknown>[] = data.jobs_results ?? [];

  return jobs.map(j => {
    const ext = j.detected_extensions as Record<string, unknown> | undefined;
    const applyOptions = j.apply_options as { title?: string; link?: string }[] | undefined;
    const link = applyOptions?.[0]?.link
      ?? String((j.related_links as { link?: string }[] | undefined)?.[0]?.link ?? '')
      ?? '';
    return {
      id: `gj-${j.job_id ?? link}`,
      title: String(j.title ?? ''),
      company: String(j.company_name ?? ''),
      location: String(j.location ?? '').replace(/^via .*$/i, '').trim(),
      url: link || String(j.share_link ?? ''),
      summary: String(j.description ?? '').slice(0, 300),
      pubDate: String(ext?.posted_at ?? ''), // format relatif "il y a 3 jours"
      salary: String(ext?.salary ?? ''),
      contract_type: String(ext?.schedule_type ?? ''),
      source: String(j.via ?? 'Google Jobs').replace(/^via\s+/i, ''),
    };
  }).filter(i => i.title && i.url);
}

/* ── Route ──────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q     = sp.get('q') ?? 'ingénieur alternance';
  const force = sp.get('force') === '1';
  const ftCid    = sp.get('cid') ?? '';
  const ftSecret = sp.get('cs') ?? '';
  const serpKey  = sp.get('serp') ?? '';

  if (!serpKey && (!ftCid || !ftSecret)) {
    return NextResponse.json({ items: [], error: 'NO_CREDENTIALS' });
  }

  const key = `${ftCid}|${serpKey.slice(0, 8)}|${q.toLowerCase().trim()}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ items: cached.items, cachedAt: cached.at, cached: true });
  }

  const errors: string[] = [];
  const results = await Promise.allSettled([
    serpKey ? fetchGoogleJobs(q, serpKey) : Promise.resolve([]),
    ftCid && ftSecret ? fetchFranceTravail(q, ftCid, ftSecret) : Promise.resolve([]),
  ]);

  const items: FeedItem[] = [];
  results.forEach((r, idx) => {
    if (r.status === 'fulfilled') items.push(...r.value);
    else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      if (msg === 'SERP_AUTH') errors.push('Clé SerpAPI invalide');
      else if (msg === 'SERP_QUOTA') errors.push('Quota SerpAPI épuisé (250/mois)');
      else if (msg.includes('Auth FT')) errors.push('Identifiants France Travail invalides');
      else errors.push(idx === 0 ? `Google Jobs : ${msg}` : `France Travail : ${msg}`);
    }
  });

  // Dédupliquer par titre+entreprise normalisés (les deux sources se recoupent)
  const seen = new Set<string>();
  const unique = items.filter(i => {
    const k = `${i.title} ${i.company}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Si tout a échoué → erreur ; sinon résultats + warnings éventuels
  if (unique.length === 0 && errors.length > 0) {
    return NextResponse.json({ items: [], error: errors.join(' · ') }, { status: 502 });
  }

  cache.set(key, { items: unique, at: Date.now() });
  return NextResponse.json({
    items: unique,
    cachedAt: Date.now(),
    cached: false,
    warnings: errors.length ? errors : undefined,
  });
}
