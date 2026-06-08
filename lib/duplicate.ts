/**
 * Détection intelligente de doublons entre offres d'emploi.
 * Critères : URL, entreprise + intitulé du poste + lieu (optionnel)
 */

/** Normalise une chaîne : minuscules, sans accents, sans ponctuation, espaces collapsés */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenise et retire les mots vides courants */
const STOP_WORDS = new Set([
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'en',
  'the', 'a', 'an', 'of', 'for', 'in', 'at', 'to', 'and', 'or',
  'h', 'f', 'hf', 'senior', 'junior', 'stage', 'alternance',
  'cdi', 'cdd', 'freelance',
]);

function tokens(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(' ')
      .filter(t => t.length > 1 && !STOP_WORDS.has(t))
  );
}

/** Score de similarité Jaccard entre deux ensembles de tokens (0–1) */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = [...a].filter(t => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

/**
 * Normalise une URL pour comparaison :
 * - minuscules
 * - supprime le protocole
 * - supprime les query params et fragments
 * - supprime le trailing slash
 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    return (u.hostname + u.pathname).toLowerCase().replace(/\/$/, '');
  } catch {
    return url.toLowerCase().trim();
  }
}

export type DuplicateReason = 'url' | 'content';

export type DuplicateResult = {
  isDuplicate: boolean;
  score: number;      // 0–1
  reason: DuplicateReason;
};

export type JobLike = {
  title: string;
  company: string;
  location?: string | null;
  url?: string | null;
};

/**
 * Retourne true si `candidate` ressemble à `existing`.
 * Vérifie d'abord l'URL, puis le contenu (poste + entreprise + lieu).
 */
export function isDuplicate(candidate: JobLike, existing: JobLike): DuplicateResult {
  // 1. Correspondance URL (prioritaire)
  if (candidate.url && existing.url) {
    const urlA = normalizeUrl(candidate.url);
    const urlB = normalizeUrl(existing.url);
    if (urlA === urlB) {
      return { isDuplicate: true, score: 1, reason: 'url' };
    }
    // URL très similaire : même domaine + chemin proche (ex. paramètres différents)
    try {
      const hostA = new URL(candidate.url).hostname;
      const hostB = new URL(existing.url).hostname;
      if (hostA === hostB) {
        const pathScore = jaccard(tokens(urlA), tokens(urlB));
        if (pathScore >= 0.8) {
          return { isDuplicate: true, score: pathScore, reason: 'url' };
        }
      }
    } catch { /* URL malformée, on ignore */ }
  }

  // 2. Correspondance sur le contenu
  const companyA = tokens(candidate.company);
  const companyB = tokens(existing.company);
  const companyScore = jaccard(companyA, companyB);

  if (companyScore < 0.5) return { isDuplicate: false, score: 0, reason: 'content' };

  const titleA = tokens(candidate.title);
  const titleB = tokens(existing.title);
  const titleScore = jaccard(titleA, titleB);

  const combined = companyScore * 0.4 + titleScore * 0.6;

  let locationBonus = 0;
  if (candidate.location && existing.location) {
    const locScore = jaccard(tokens(candidate.location), tokens(existing.location));
    locationBonus = locScore * 0.15;
  }

  const finalScore = Math.min(1, combined + locationBonus);

  return {
    isDuplicate: finalScore >= 0.55,
    score: finalScore,
    reason: 'content',
  };
}
