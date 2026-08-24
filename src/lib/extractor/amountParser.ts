/**
 * Parses a currency string into a number. Returns null for non-numeric input.
 * Handles: ₱, $, €, £, P/PHP/PHP prefix (Philippine Peso written as letter),
 * commas, whitespace, and (negative) parentheses.
 */
export function parseAmount(text: string): number | null {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const isNegative = trimmed.startsWith("(") || trimmed.startsWith("-") || trimmed.startsWith("-(");

  // Strip currency symbols, written prefixes (Php, PHP, P followed by space), and whitespace
  const cleaned = trimmed
    .replace(/[₱$€£]/g, "")
    .replace(/\b(Php|PHP|php)\b\s*/g, "")
    // standalone "P " prefix (capital P followed by space — Philippine Peso abbreviation)
    .replace(/^\(?-?\s*P\s+/i, "")
    .replace(/\s/g, "")
    .replace(/[()]/g, "")
    .replace(/^-/, "");

  // Handle comma-as-decimal-separator (e.g. "1 234,00" → "1234.00")
  const normalized = cleaned.replace(/,(\d{3})/g, "$1").replace(",", ".");

  const value = parseFloat(normalized);
  if (isNaN(value)) return null;

  return isNegative ? -value : value;
}
