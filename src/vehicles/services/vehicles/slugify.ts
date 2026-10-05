/**
 * Converts text to a clean URL-safe kebab-case slug:
 * - Decomposes and strips diacritics (e.g., ą -> a, ł -> l, é -> e)
 * - Converts to lowercase
 * - Replaces whitespace and non-alphanumerics with a single hyphen
 * - Trims leading and trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
