import { registerAs } from '@nestjs/config';

function parseTtlToMs(
  ttl: string | number | undefined,
  fallbackMs: number,
): number {
  if (!ttl) return fallbackMs;
  if (typeof ttl === 'number') return ttl * 1000;
  const m = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!m) return Number.isFinite(+ttl) ? +ttl * 1000 : fallbackMs;
  const n = parseInt(m[1], 10);
  const unit = m[2];
  const mult =
    unit === 's'
      ? 1000
      : unit === 'm'
        ? 60_000
        : unit === 'h'
          ? 3_600_000
          : 86_400_000;
  return n * mult;
}

export default registerAs('auth', () => {
  const accessTtl = process.env.JWT_ACCESS_TTL ?? '120s';
  const refreshTtl = process.env.JWT_REFRESH_TTL ?? '300s';
  const skew = process.env.SKEW ?? '5s';

  const accessMs = parseTtlToMs(accessTtl, 120_000);
  const refreshMs = parseTtlToMs(refreshTtl, 300_000);
  const skewMs = parseTtlToMs(skew, 5_000);

  return {
    // Para firmar JWT:
    accessTtl, // ej. '1200s'
    refreshTtl, // ej. '3600s'

    // Para cookies (un poco más cortas que el JWT):
    accessCookieMs: Math.max(1_000, accessMs - skewMs),
    refreshCookieMs: Math.max(1_000, refreshMs - skewMs),
  };
});
