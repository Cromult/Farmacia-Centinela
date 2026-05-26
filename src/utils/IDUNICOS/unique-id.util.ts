// src/utils/IDUNICOS/unique-id.util.ts
import { randomBytes } from 'crypto';

/**
 * Genera un ID único seguro para cualquier tabla.
 * @param prefix - Prefijo que representa la tabla (ej: 'US' para users)
 * @param lengthRandom - Cantidad de caracteres aleatorios (default: 6)
 * @returns ID único tipo: US-1693043205123-A1B2C3
 */
export function generateUniqueId(prefix: string, lengthRandom = 6): string {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('El prefijo de la tabla es obligatorio y debe ser string');
  }

  // Timestamp en milisegundos
  const timestamp = Date.now();

  // Generar caracteres aleatorios seguros
  const random = randomBytes(Math.ceil(lengthRandom / 2))
    .toString('hex')
    .toUpperCase()
    .slice(0, lengthRandom);

  // Formato final: PREFIX-TIMESTAMP-RANDOM
  return `${prefix.toUpperCase()}-${timestamp}-${random}`;
}
