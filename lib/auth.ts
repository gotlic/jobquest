import { createHash, createHmac } from 'crypto';

export const SPACE_COOKIE = 'jq_space';
export const AUTH_COOKIE = SPACE_COOKIE;

const TOKEN_SECRET = process.env.TOKEN_SECRET ?? 'jq_tok_s3cr3t_d3f4ult_k3y_2024';
const PASSWORD_SALT = 'jq_pw_salt_2024';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + PASSWORD_SALT).digest('hex');
}

export function createSpaceToken(spaceId: number): string {
  const payload = String(spaceId);
  const sig = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function validateSpaceToken(token: string): number | null {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return null;
    const payload = token.substring(0, dot);
    const sig = token.substring(dot + 1);
    const expected = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    const id = parseInt(payload, 10);
    return isNaN(id) || id <= 0 ? null : id;
  } catch {
    return null;
  }
}

/** Extrait le spaceId depuis le cookie d'une requête (middleware ou route handler) */
export function getSpaceIdFromCookie(token: string | undefined): number | null {
  if (!token) return null;
  return validateSpaceToken(token);
}
