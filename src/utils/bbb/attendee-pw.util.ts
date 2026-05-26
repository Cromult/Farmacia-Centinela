//src/utils/bbb/attendee-pw.util.ts
import * as crypto from 'crypto';

export function generateAttendeePW(
  groupId: string,
  title: string,
  meetingID: string,
): string {
  const base = `${groupId}student${title}${meetingID}`;

  const hash = crypto.createHash('sha1').update(base).digest('hex');

  return hash.slice(0, 12);
}