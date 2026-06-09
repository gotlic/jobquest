/**
 * Détection intelligente de doublons entre offres d'emploi.
 *
 * Logique : un doublon = même offre postée deux fois.
 * Ce n'est PAS un doublon si c'est juste la même entreprise ou le même type de poste.
 *
 * Critères (par ordre de priorité) :
 *  1. URL exacte → doublon certain
 *  2. Entreprise quasi-identique (≥ 0.8) ET titre quasi-identique (≥ 0.65) → doublon
 *
 * Les URL Jaccard ont été supprimées car elles causaient des faux positifs
 * sur les sites à URL structurée (WTTJ, LinkedIn, Indeed) où deux offres différentes
 * de la même entreprise partagent beaucoup de tokens communs dans le chemin.
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

/**
 * Mots vides : articles, conjonctions, et surtout les qualificatifs de poste
 * génériques qui ne discriminent PAS entre deux offres différentes
 * (ex: "Ingénieur" seul ne suffit pas à dire que deux offres sont identiques).
 */
const STOP_WORDS = new Set([
  // Articles / prépositions FR
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'en', 'au', 'aux',
  'sur', 'par', 'pour', 'avec', 'dans', 'ce', 'se',
  // Articles / prépositions EN
  'the', 'a', 'an', 'of', 'for', 'in', 'at', 'to', 'and', 'or', 'with',
  // Qualificatifs de genre / niveau trop génériques
  'h', 'f', 'hf', 'mf',
  // Types de contrat (ne différencient pas deux offres)
  'stage', 'alternance', 'cdi', 'cdd', 'freelance', 'vie', 'interim',
  // Niveaux (trop génériques quand seuls)
  'senior', 'junior', 'confirme', 'debutant',
  // Mots génériques de poste qui seuls ne discriminent pas
  'ingenieur', 'charge', 'responsable', 'directeur', 'manager',
  'consultant', 'technicien', 'assistant', 'chef', 'coordinateur',
  'analyste', 'developpeur', 'architecte',
]);

function tokens(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(' ')
      .filter(t => t.length > 2 && !STOP_WORDS.has(t))
  );
}

/** Score de similarité Jaccard entre deux ensembles de tokens (0–1) */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter(t => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

/**
 * Normalise une URL pour comparaison exacte :
 * - minuscules
 * - supprime protocole, query params, fragments
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
  score: number;      // 0–100 (affiché comme %)
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
 *
 * Règles strictes pour éviter les faux positifs :
 *  - URL exacte → doublon immédiat
 *  - Entreprise très similaire (≥ 0.8) ET titre très similaire (≥ 0.65) → doublon
 *  - Le lieu peut confirmer (+bonus) mais ne suffit pas seul
 */
export function isDuplicate(candidate: JobLike, existing: JobLike): DuplicateResult {
  // 1. Correspondance URL exacte uniquement (pas de Jaccard URL)
  if (candidate.url && existing.url) {
    const urlA = normalizeUrl(candidate.url);
    const urlB = normalizeUrl(existing.url);
    if (urlA === urlB) {
      return { isDuplicate: true, score: 100, reason: 'url' };
    }
  }

  // 2. Correspondance contenu : entreprise ET titre doivent tous les deux être similaires
  const companyA = tokens(candidate.company);
  const companyB = tokens(existing.company);
  const companyScore = jaccard(companyA, companyB);

  // Gate strict : entreprises doivent être très similaires
  if (companyScore < 0.8) {
    return { isDuplicate: false, score: Math.round(companyScore * 50), reason: 'content' };
  }

  const titleA = tokens(candidate.title);
  const titleB = tokens(existing.title);
  const titleScore = jaccard(titleA, titleB);

  // Le titre doit lui-même dépasser un seuil minimum
  if (titleScore < 0.5) {
    return { isDuplicate: false, score: Math.round(titleScore * 70), reason: 'content' };
  }

  // Score combiné : titre pèse plus lourd (c'est lui qui différencie deux postes)
  const combined = companyScore * 0.3 + titleScore * 0.7;

  // Bonus lieu (confirme mais ne décide pas)
  let locationBonus = 0;
  if (candidate.location && existing.location) {
    const locScore = jaccard(tokens(candidate.location), tokens(existing.location));
    locationBonus = locScore * 0.1;
  }

  const finalScore = Math.min(1, combined + locationBonus);

  return {
    isDuplicate: finalScore >= 0.75,
    score: Math.round(finalScore * 100),
    reason: 'content',
  };
}
