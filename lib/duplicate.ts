/**
 * Détection intelligente de doublons entre offres d'emploi.
 * Critères : entreprise + intitulé du poste + lieu (optionnel)
 */

/** Normalise une chaîne : minuscules, sans accents, sans ponctuation, espaces collapsés */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // supprime les accents
    .replace(/[^a-z0-9\s]/g, ' ')   // ponctuation → espace
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenise et retire les mots vides courants */
const STOP_WORDS = new Set([
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'en',
  'the', 'a', 'an', 'of', 'for', 'in', 'at', 'to', 'and', 'or',
  'h', 'f', 'hf', 'h/f', 'senior', 'junior', 'stage', 'alternance',
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

export type DuplicateResult = {
  isDuplicate: boolean;
  score: number; // 0–1
};

export type JobLike = {
  title: string;
  company: string;
  location?: string | null;
};

/**
 * Retourne true si `candidate` ressemble à `existing`.
 * Seuil : entreprise très similaire ET titre similaire à 50%+
 */
export function isDuplicate(candidate: JobLike, existing: JobLike): DuplicateResult {
  const companyA = tokens(candidate.company);
  const companyB = tokens(existing.company);
  const companyScore = jaccard(companyA, companyB);

  // Si l'entreprise ne correspond pas du tout, pas un doublon
  if (companyScore < 0.5) return { isDuplicate: false, score: 0 };

  const titleA = tokens(candidate.title);
  const titleB = tokens(existing.title);
  const titleScore = jaccard(titleA, titleB);

  // Score combiné pondéré (entreprise 40%, titre 60%)
  const combined = companyScore * 0.4 + titleScore * 0.6;

  // Bonus si même lieu (ou aucun lieu des deux côtés)
  let locationBonus = 0;
  if (candidate.location && existing.location) {
    const locScore = jaccard(tokens(candidate.location), tokens(existing.location));
    locationBonus = locScore * 0.15;
  }

  const finalScore = Math.min(1, combined + locationBonus);

  return {
    isDuplicate: finalScore >= 0.55,
    score: finalScore,
  };
}
