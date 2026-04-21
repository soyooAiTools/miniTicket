import { createHash, randomBytes } from 'node:crypto';

export const ADMIN_SESSION_COOKIE_NAME = 'mini_ticket_admin_session';
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function parseCookie(
  cookieHeader: string | string[] | undefined,
  cookieName: string,
) {
  const rawHeader = Array.isArray(cookieHeader)
    ? cookieHeader[0]
    : cookieHeader;

  if (!rawHeader) {
    return undefined;
  }

  for (const part of rawHeader.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');

    if (name === cookieName) {
      return valueParts.join('=');
    }
  }

  return undefined;
}
