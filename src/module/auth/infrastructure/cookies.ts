import type { Response } from 'express';
type SameSite = 'lax' | 'strict' | 'none';

export function setAuthCookies(res: Response, tokens: { access: string; refresh: string }, opts: { secure: boolean; sameSite: SameSite; accessMs: number; refreshMs: number; }) {
  const base = { httpOnly: true, secure: opts.secure, sameSite: opts.sameSite } as const;
  res.cookie('access_token', tokens.access, { ...base, path: '/', maxAge: opts.accessMs });
  res.cookie('refresh_token', tokens.refresh, { ...base, path: '/auth/refresh', maxAge: opts.refreshMs });
}

export function clearAuthCookies(res: Response) {
  res.cookie('access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookie('refresh_token', '', { httpOnly: true, path: '/auth/refresh', maxAge: 0 });
}
