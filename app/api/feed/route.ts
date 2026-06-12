import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export type FeedItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  summary: string;
  pubDate: string;    // libellé affichable ("il y a 2 jours" ou date ISO)
  postedTs: number;   // timestamp ms pour le tri (0 = inconnu)
  salary: string;
  contract_type: string;
  source: string;
};

// Cache in-process par clé de recherche (6h)
const cache = new Map<string, { items: FeedItem[]; at: number }>();
const TTL = 6 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Normalise pour comparaison : minuscules, sans accents, alphanumérique seul */
function normKey(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

/** Charge la blocklist (entreprises et offres masquées) depuis la base */
async function loadBlocklist(): Promise<{ companies: Set<string>; offers: Set<string> }> {
  const companies = new Set<string>();
  const offers = new Set<string>();
  try {
    const db = await getDb();
    const rows = db.prepare('SELECT kind, value FROM feed_blocklist').all() as { kind: string; value: string }[];
    rows.forEach(r => (r.kind === 'company' ? companies : offers).add(r.value));
  } catch (e) {
    console.error('[feed] blocklist load error (non-blocking):', e);
  }
  return { companies, offers };
}

/** Retire les offres dont l'entreprise ou l'offre elle-même est bloquée */
function applyBlocklist(items: FeedItem[], bl: { companies: Set<string>; offers: Set<string> }): FeedItem[] {
  if (bl.companies.size === 0 && bl.offers.size === 0) return items;
  return items.filter(i =>
    !bl.companies.has(normKey(i.company)) &&
    !bl.offers.has(normKey(`${i.title} ${i.company}`))
  );
}

/** Convertit une date relative ("il y a 3 jours") ou ISO en timestamp ms. 0 si inconnue. */
function parsePostedTs(s: string): number {
  if (!s) return 0;
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso.getTime();
  const m = s.match(/(\d+)\s*(minute|min\b|heure|hour|jour|day|semaine|week|mois|month)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    const ms =
      u.startsWith('min') ? 60_000 :
      u.startsWith('heure') || u.startsWith('hour') ? 3_600_000 :
      u.startsWith('jour') || u.startsWith('day') ? 86_400_000 :
      u.startsWith('semaine') || u.startsWith('week') ? 604_800_000 :
      2_592_000_000; // mois
    return Date.now() - n * ms;
  }
  if (/aujourd/i.test(s)) return Date.now();
  if (/hier/i.test(s)) return Date.now() - 86_400_000;
  return 0;
}

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
  // minCreationDate / maxCreationDate : format yyyy-MM-dd'T'HH:mm:ss'Z'
  const minDate = new Date(Date.now() - WEEK_MS).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const maxDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    motsCles: q,
    range: '0-49',
    sort: '1',
    minCreationDate: minDate,
    maxCreationDate: maxDate,
  });
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
    const dateCreation = String(o.dateCreation ?? '');
    return {
      id: `ft-${o.id}`,
      title: String(o.intitule ?? ''),
      company: String(entreprise?.nom ?? ''),
      location: String(lieu?.libelle ?? ''),
      url: `https://candidat.francetravail.fr/offres/emploi/detail/${o.id}`,
      summary: String(o.description ?? '').slice(0, 300),
      pubDate: dateCreation,
      postedTs: parsePostedTs(dateCreation),
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
    chips: 'date_posted:week', // uniquement les annonces de la semaine
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
    const postedAt = String(ext?.posted_at ?? '');
    return {
      id: `gj-${j.job_id ?? link}`,
      title: String(j.title ?? ''),
      company: String(j.company_name ?? ''),
      location: String(j.location ?? '').replace(/^via .*$/i, '').trim(),
      url: link || String(j.share_link ?? ''),
      summary: String(j.description ?? '').slice(0, 300),
      pubDate: postedAt,
      postedTs: parsePostedTs(postedAt),
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
  // Clé SerpAPI : fournie par le client OU configurée côté serveur (.env.local)
  const serpKey  = sp.get('serp') || process.env.SERPAPI_KEY || '';

  if (!serpKey && (!ftCid || !ftSecret)) {
    return NextResponse.json({ items: [], error: 'NO_CREDENTIALS' });
  }

  const blocklist = await loadBlocklist();

  const key = `${ftCid}|${serpKey.slice(0, 8)}|${q.toLowerCase().trim()}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ items: applyBlocklist(cached.items, blocklist), cachedAt: cached.at, cached: true });
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

  // Garder uniquement la semaine : date connue ET récente, ou date inconnue
  // (Google Jobs est déjà filtré semaine côté API, on tolère ses dates manquantes)
  const weekAgo = Date.now() - WEEK_MS;
  const fresh = items.filter(i => i.postedTs === 0 || i.postedTs >= weekAgo);

  // Dédupliquer par titre+entreprise normalisés (les sources se recoupent)
  const seen = new Set<string>();
  const unique = fresh.filter(i => {
    const k = normKey(`${i.title} ${i.company}`);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Tri : plus récent en premier, dates inconnues à la fin
  unique.sort((a, b) => (b.postedTs || 0) - (a.postedTs || 0));

  if (unique.length === 0 && errors.length > 0) {
    return NextResponse.json({ items: [], error: errors.join(' · ') }, { status: 502 });
  }

  // Le cache stocke la liste NON filtrée : la blocklist est appliquée à la
  // lecture pour qu'un blocage soit effectif immédiatement, cache chaud ou non
  cache.set(key, { items: unique, at: Date.now() });
  return NextResponse.json({
    items: applyBlocklist(unique, blocklist),
    cachedAt: Date.now(),
    cached: false,
    warnings: errors.length ? errors : undefined,
  });
}
