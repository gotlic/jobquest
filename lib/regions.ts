/**
 * Référentiel continents → pays (codes ISO 3166-1 alpha-2).
 * Les noms affichés/recherchés sont générés via Intl.DisplayNames (fr/en),
 * disponible côté navigateur et Node 20+.
 */

export type Continent = { id: string; labelFr: string; labelEn: string; countries: string[] };

export const CONTINENTS: Continent[] = [
  {
    id: 'europe', labelFr: 'Europe', labelEn: 'Europe',
    countries: ['FR', 'DE', 'GB', 'CH', 'BE', 'LU', 'NL', 'IT', 'ES', 'PT', 'IE', 'AT', 'DK', 'SE', 'NO', 'FI', 'IS', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY', 'AL', 'BA', 'MK', 'ME', 'RS', 'MD', 'UA', 'BY', 'AD', 'MC', 'LI', 'SM'],
  },
  {
    id: 'amerique-nord', labelFr: 'Amérique du Nord', labelEn: 'North America',
    countries: ['US', 'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'DO', 'HT', 'JM', 'TT', 'BS', 'BB'],
  },
  {
    id: 'amerique-sud', labelFr: 'Amérique du Sud', labelEn: 'South America',
    countries: ['BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'BO', 'PY', 'UY', 'VE', 'GY', 'SR'],
  },
  {
    id: 'afrique', labelFr: 'Afrique', labelEn: 'Africa',
    countries: ['MA', 'DZ', 'TN', 'LY', 'EG', 'SN', 'CI', 'GH', 'NG', 'CM', 'GA', 'CG', 'CD', 'KE', 'ET', 'TZ', 'UG', 'RW', 'ZA', 'NA', 'BW', 'ZM', 'ZW', 'MZ', 'MG', 'MU', 'AO', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GN', 'MR', 'SD', 'SS', 'SO', 'DJ', 'ER', 'GM', 'SL', 'LR', 'CV', 'SC'],
  },
  {
    id: 'asie', labelFr: 'Asie', labelEn: 'Asia',
    countries: ['JP', 'CN', 'HK', 'TW', 'KR', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'IN', 'PK', 'BD', 'LK', 'NP', 'KH', 'LA', 'MM', 'MN', 'KZ', 'UZ', 'KG', 'TJ', 'TM', 'AF', 'IR', 'IQ', 'SY', 'LB', 'JO', 'IL', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'TR', 'GE', 'AM', 'AZ', 'BN', 'BT'],
  },
  {
    id: 'oceanie', labelFr: 'Océanie', labelEn: 'Oceania',
    countries: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'PF'],
  },
];

export const ALL_CODES: string[] = CONTINENTS.flatMap(c => c.countries);

const dnFr = typeof Intl !== 'undefined' ? new Intl.DisplayNames(['fr'], { type: 'region' }) : null;
const dnEn = typeof Intl !== 'undefined' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

export function countryNameFr(code: string): string {
  try { return dnFr?.of(code) ?? code; } catch { return code; }
}
export function countryNameEn(code: string): string {
  try { return dnEn?.of(code) ?? code; } catch { return code; }
}

/** Liste des labels continents (en anglais, tels qu'envoyés comme zones de recherche) */
export const CONTINENT_LABELS_EN = new Set(CONTINENTS.map(c => c.labelEn));
