import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';
import { ALL_CODES, CONTINENTS, CONTINENT_LABELS_EN, countryNameEn, countryNameFr } from '@/lib/regions';

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
  /** Zone de recherche dont provient l'offre (interne, pour le filtre pays) */
  zone?: string;
};

// Cache in-process par clé de recherche (6h)
const cache = new Map<string, { items: FeedItem[]; at: number }>();
const TTL = 6 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/* ── Traduction des mots-clés (fr → en + es) ────────────────── */

// Cache in-process : une traduction par jeu de mots-clés, tant que le worker vit
const translationCache = new Map<string, string>();

/**
 * Construit la requête multilingue "mots-clés fr OR en OR es" pour élargir
 * la recherche aux annonces rédigées en anglais ou en espagnol.
 * En cas d'échec (pas de clé API, erreur réseau), on garde le français seul.
 */
async function multilingualQuery(q: string): Promise<string> {
  const key = q.toLowerCase().trim();
  if (translationCache.has(key)) return translationCache.get(key)!;
  if (!process.env.ANTHROPIC_API_KEY) return q;
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Traduis ces mots-clés de recherche d'emploi du français vers l'anglais et l'espagnol. Utilise les termes que les recruteurs emploient réellement dans les annonces. Réponds UNIQUEMENT avec un JSON valide, sans markdown : {"en": "...", "es": "..."}

Mots-clés : ${q}`,
      }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const json = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    const variants = [...new Set([q, json.en, json.es].filter(v => typeof v === 'string' && v.trim()))];
    const result = variants.join(' OR ');
    translationCache.set(key, result);
    return result;
  } catch (e) {
    console.error('[feed] translation error (non-blocking):', e);
    return q;
  }
}

/** Normalise pour comparaison : minuscules, sans accents, alphanumérique seul */
function normKey(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

type Blocklist = { companies: Set<string>; offers: Set<string>; kanbanKeys: Set<string>; kanbanUrls: Set<string> };

/** Charge la blocklist + les offres déjà dans le Kanban depuis la base (filtrées par espace) */
async function loadBlocklist(spaceId: number): Promise<Blocklist> {
  const companies = new Set<string>();
  const offers = new Set<string>();
  const kanbanKeys = new Set<string>();
  const kanbanUrls = new Set<string>();
  try {
    const db = await getDb();
    const rows = db.prepare('SELECT kind, value FROM feed_blocklist WHERE space_id = ?').all(spaceId) as { kind: string; value: string }[];
    rows.forEach(r => (r.kind === 'company' ? companies : offers).add(r.value));
    // Les offres déjà ajoutées au Kanban ne doivent plus être proposées
    const jobs = db.prepare('SELECT title, company, url FROM jobs WHERE space_id = ?').all(spaceId) as { title: string; company: string; url: string | null }[];
    jobs.forEach(j => {
      kanbanKeys.add(normKey(`${j.title} ${j.company}`));
      if (j.url) kanbanUrls.add(j.url.split('?')[0].toLowerCase().replace(/\/$/, ''));
    });
  } catch (e) {
    console.error('[feed] blocklist load error (non-blocking):', e);
  }
  return { companies, offers, kanbanKeys, kanbanUrls };
}

/** Retire les offres bloquées (entreprise/offre) et celles déjà dans le Kanban */
function applyBlocklist(items: FeedItem[], bl: Blocklist): FeedItem[] {
  return items.filter(i =>
    !bl.companies.has(normKey(i.company)) &&
    !bl.offers.has(normKey(`${i.title} ${i.company}`)) &&
    !bl.kanbanKeys.has(normKey(`${i.title} ${i.company}`)) &&
    !bl.kanbanUrls.has(i.url.split('?')[0].toLowerCase().replace(/\/$/, ''))
  );
}

/* ── Détection du pays d'une offre depuis son champ localisation ── */

function normLoc(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Matchers triés par longueur décroissante (évite Niger ⊂ Nigeria, Georgia ⊂ United States…)
const COUNTRY_MATCHERS: { code: string; re: RegExp }[] = ALL_CODES
  .flatMap(code => {
    const names = [...new Set([countryNameFr(code), countryNameEn(code)])];
    return names.map(n => ({ code, name: normLoc(n) }));
  })
  .sort((a, b) => b.name.length - a.name.length)
  .map(({ code, name }) => ({
    code,
    re: new RegExp(`(^|[^a-z])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`),
  }));

/** Retourne le code pays détecté dans une chaîne de localisation, ou null */
function detectCountry(location: string): string | null {
  if (!location) return null;
  const loc = normLoc(location);
  for (const m of COUNTRY_MATCHERS) {
    if (m.re.test(loc)) return m.code;
  }
  return null;
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

/* ── LinkedIn (endpoint public invité — gratuit, mondial) ───── */

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}

async function fetchLinkedIn(q: string, location: string): Promise<FeedItem[]> {
  const params = new URLSearchParams({
    keywords: q,
    location,
    f_TPR: 'r604800', // annonces des 7 derniers jours
    start: '0',
  });
  const res = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // en : LinkedIn renvoie alors "Ville, Région, Pays" → détection du pays fiable
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`LinkedIn ${res.status}`);
  const raw = await res.text();

  // Une carte par <li> — parsing par carte pour garder les champs alignés
  return raw.split(/<li>/).slice(1).map(card => {
    const pick = (re: RegExp) => card.match(re)?.[1]?.trim() ?? '';
    const title    = decodeEntities(pick(/base-search-card__title">\s*([^<]+?)\s*</));
    const company  = decodeEntities(
      pick(/base-search-card__subtitle">\s*<a[^>]*>\s*([^<]+?)\s*</) ||
      pick(/base-search-card__subtitle">\s*([^<]+?)\s*</)
    );
    const loc      = decodeEntities(pick(/job-search-card__location">\s*([^<]+?)\s*</));
    const date     = pick(/datetime="([^"]+)"/);
    const linkRaw  = pick(/base-card__full-link[^"]*"\s+href="([^"]+)"/);
    const url      = decodeEntities(linkRaw).split('?')[0];

    return {
      id: `li-${url}`,
      title,
      company,
      location: loc,
      url,
      summary: '',
      pubDate: date,
      postedTs: parsePostedTs(date),
      salary: '',
      contract_type: '',
      source: 'LinkedIn',
    };
  }).filter(i => i.title && i.url);
}

/* ── SerpAPI / Google Jobs ──────────────────────────────────── */

async function fetchGoogleJobs(q: string, apiKey: string, location: string): Promise<FeedItem[]> {
  const isFrance = /france/i.test(location);

  async function call(params: URLSearchParams): Promise<Record<string, unknown>> {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
    return res.json();
  }

  const base = {
    engine: 'google_jobs',
    google_domain: isFrance ? 'google.fr' : 'google.com',
    ...(isFrance ? { gl: 'fr' } : {}),
    hl: 'fr',
    chips: 'date_posted:week', // uniquement les annonces de la semaine
    api_key: apiKey,
  };

  let data = await call(new URLSearchParams({ ...base, q, location }));

  // SerpAPI ne connaît pas tous les lieux : fallback en mettant le lieu dans la requête
  if (data.error && /unsupported.*location/i.test(String(data.error))) {
    data = await call(new URLSearchParams({ ...base, q: `${q} ${location}` }));
  }

  if (data.error) {
    const msg = String(data.error);
    if (/invalid api key/i.test(msg)) throw new Error('SERP_AUTH');
    if (/run out of searches/i.test(msg)) throw new Error('SERP_QUOTA');
    if (/returned any results/i.test(msg)) return [];
    throw new Error(`SerpAPI: ${msg.slice(0, 150)}`);
  }
  const jobs = (data.jobs_results as Record<string, unknown>[] | undefined) ?? [];

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
  // Zones de recherche : continents ("Europe") et/ou pays ("Switzerland"), calculées côté client
  const zones = (sp.get('zones') ?? 'France').split(',').map(z => z.trim()).filter(Boolean).slice(0, 8);
  // Pays sélectionnés (codes ISO) — filtre appliqué aux résultats ; vide = pas de filtre
  const sel   = new Set((sp.get('sel') ?? '').split(',').map(c => c.trim().toUpperCase()).filter(Boolean));

  // Clés API depuis l'espace de l'utilisateur (DB) ou fallback env
  const sid = parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
  let serpKey = process.env.SERPAPI_KEY || '';
  let ftCid = '';
  let ftSecret = '';
  try {
    const db = await getDb();
    const space = db.prepare('SELECT serpapi_key, ft_client_id, ft_client_secret FROM spaces WHERE id = ?').get(sid) as { serpapi_key: string; ft_client_id: string; ft_client_secret: string } | undefined;
    if (space) {
      if (space.serpapi_key) serpKey = space.serpapi_key;
      ftCid = space.ft_client_id || '';
      ftSecret = space.ft_client_secret || '';
    }
  } catch { /* fallback env */ }

  // France Travail n'a de sens que si la France est dans la sélection
  const franceSelected = sel.size === 0 ? zones.some(z => /france/i.test(z)) : sel.has('FR');
  const useFT = !!(ftCid && ftSecret) && franceSelected;

  const blocklist = await loadBlocklist(sid);

  const key = `${sid}|${serpKey.slice(0, 8)}|${zones.join('+').toLowerCase()}|${[...sel].sort().join('')}|${q.toLowerCase().trim()}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ items: applyBlocklist(cached.items, blocklist), cachedAt: cached.at, cached: true });
  }

  // Requête multilingue (fr OR en OR es) pour LinkedIn et Google Jobs
  const mq = await multilingualQuery(q);

  // Tag chaque résultat avec sa zone d'origine (sert de fallback pays au filtre)
  const tagged = (p: Promise<FeedItem[]>, zone: string) => p.then(items => items.map(i => ({ ...i, zone })));

  // LinkedIn (gratuit) : une recherche par zone, continents acceptés
  const sources: { name: string; promise: Promise<FeedItem[]> }[] = zones.map(z => ({
    name: `LinkedIn ${z}`,
    promise: tagged(fetchLinkedIn(mq, z), z),
  }));
  // SerpAPI (quota 250/mois) : uniquement sur les zones pays, 3 max
  if (serpKey) {
    zones.filter(z => !CONTINENT_LABELS_EN.has(z)).slice(0, 3).forEach(z => {
      sources.push({ name: `Google Jobs ${z}`, promise: tagged(fetchGoogleJobs(mq, serpKey, z), z) });
    });
  }
  // France Travail : API française, mots-clés français uniquement
  if (useFT) sources.push({ name: 'France Travail', promise: tagged(fetchFranceTravail(q, ftCid, ftSecret), 'France') });

  const errors: string[] = [];
  const results = await Promise.allSettled(sources.map(s => s.promise));

  const items: FeedItem[] = [];
  results.forEach((r, idx) => {
    if (r.status === 'fulfilled') items.push(...r.value);
    else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      if (msg === 'SERP_AUTH') errors.push('Clé SerpAPI invalide');
      else if (msg === 'SERP_QUOTA') errors.push('Quota SerpAPI épuisé (250/mois)');
      else if (msg.includes('Auth FT')) errors.push('Identifiants France Travail invalides');
      else errors.push(`${sources[idx].name} : ${msg}`);
    }
  });

  // Garder uniquement la semaine : date connue ET récente, ou date inconnue
  // (Google Jobs est déjà filtré semaine côté API, on tolère ses dates manquantes)
  const weekAgo = Date.now() - WEEK_MS;
  let fresh = items.filter(i => i.postedTs === 0 || i.postedTs >= weekAgo);

  // Filtre pays : si une sélection existe et ne couvre pas tout le référentiel
  if (sel.size > 0 && sel.size < ALL_CODES.length) {
    const codeByEn = new Map(ALL_CODES.map(c => [countryNameEn(c), c]));
    const contByEn = new Map(CONTINENTS.map(c => [c.labelEn, c]));
    fresh = fresh.filter(i => {
      // 1. Pays détecté dans la localisation → décision directe
      const detected = detectCountry(i.location);
      if (detected) return sel.has(detected);
      // 2. Zone de recherche = pays précis → l'offre vient forcément de ce pays
      const zoneCode = i.zone ? codeByEn.get(i.zone) : undefined;
      if (zoneCode) return sel.has(zoneCode);
      // 3. Zone = continent, pays indétectable : on ne garde que si le continent
      //    est sélectionné en entier (aucune exclusion à vérifier)
      const cont = i.zone ? contByEn.get(i.zone) : undefined;
      if (cont) return cont.countries.every(c => sel.has(c));
      return true;
    });
  }

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
