// src/utils/bbb/build-bbb-url.util.ts
import { buildQuery } from './build-query.util';
import { generateChecksum } from './checksum.util';

export function buildBBBUrl(
  apiCall: string,
  params: Record<string, any>,
): string {
  // Leer variables de entorno
  const baseUrl = process.env.BBB_BASE_URL;
  const secret = process.env.BBB_SECRET;

  // Validar que las variables existan
  if (!baseUrl) {
    throw new Error('BBB_BASE_URL no está definida en las variables de entorno');
  }
  
  if (!secret) {
    throw new Error('BBB_SECRET no está definida en las variables de entorno');
  }

  const query = buildQuery(params);
  const checksum = generateChecksum(apiCall, query, secret);

  return `${baseUrl}/${apiCall}?${query}&checksum=${checksum}`;
}