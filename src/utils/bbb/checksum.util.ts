// src/utils/bbb/checksum.util.ts
import * as crypto from 'crypto';

export function generateChecksum(
  apiCall: string,
  query: string,
  secret: string,
): string {
  return crypto
    .createHash('sha1')
    .update(apiCall + query + secret)
    .digest('hex');
}