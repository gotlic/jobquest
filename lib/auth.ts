export const AUTH_COOKIE = 'jq_auth';
// Token stocké dans le cookie — peut être surchargé par AUTH_TOKEN dans .env.local
export const AUTH_TOKEN = process.env.AUTH_TOKEN ?? 'jq_a3f8c1d9e2b7';
// Mot de passe — peut être surchargé par APP_PASSWORD dans .env.local
export const APP_PASSWORD = process.env.APP_PASSWORD ?? 'lic12@';
