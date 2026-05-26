// src/utils/URLNAME/url-name.util.ts

/**
 * Extrae el nombre del archivo de una URL, incluyendo su extensión.
 * @param url URL completa del archivo
 * @returns Nombre del archivo con extensión o null si no se puede extraer
 */
export function extractFilenameFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment); // Filtra segmentos vacíos
    return pathSegments.pop() || null; // Último segmento (nombre del archivo)
  } catch (error) {
    console.error('URL inválida:', error);
    return null;
  }
}

// Ejemplos de uso
// console.log(extractFilenameFromUrl("http://localhost:9000/uvirtual/MEDIA-1234-ABCD/comprobante.pdf?...")); // "comprobante.pdf"
// console.log(extractFilenameFromUrl("https://s3.amazonaws.com/bucket/folder/archivo.jpg?query=stuff")); // "archivo.jpg"
