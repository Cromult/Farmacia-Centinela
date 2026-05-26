// src/utils/bbb/moderator-pw.util.ts
import * as crypto from 'crypto';

export function generateModeratorPW(
  title: string,
  groupId: string,
  scheduledAt: string | Date,
): string {
  const base = `${title}${groupId}${scheduledAt}moderator`;

  const hash = crypto.createHash('sha1').update(base).digest('hex');

  return hash.slice(0, 12);
}