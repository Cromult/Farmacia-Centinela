export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // quita acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina marcas diacríticas
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // quita caracteres raros
    .replace(/\s+/g, "-")         // reemplaza espacios por guiones
    .replace(/-+/g, "-");         // evita guiones múltiples
}
