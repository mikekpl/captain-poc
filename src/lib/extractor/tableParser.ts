import { parse as parseHtml } from "node-html-parser";
import { parseAmount } from "./amountParser";

const DESCRIPTION_ALIASES = ["description", "charge", "service", "item", "particulars", "details", "name"];
const AMOUNT_ALIASES = ["amount", "price", "cost", "total", "charges", "fee", "subtotal", "value"];
const SKIP_ROW_KEYWORDS = ["subtotal", "sub-total", "total due", "amount due", "balance due", "grand total", "total charges"];
const HEADER_KEYWORDS = [...DESCRIPTION_ALIASES, ...AMOUNT_ALIASES, "qty", "quantity", "rate", "date"];

export interface ParsedRow {
  description: string;
  amount: number | null;
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const idx = headers.findIndex((h) => h.toLowerCase().includes(alias));
    if (idx !== -1) return idx;
  }
  return -1;
}

function isHeaderRow(cells: string[]): boolean {
  const text = cells.join(" ").toLowerCase();
  return HEADER_KEYWORDS.some((kw) => text.includes(kw));
}

function isSkipRow(cells: string[]): boolean {
  const text = cells.join(" ").toLowerCase();
  // Skip blank rows or summary/total rows
  if (cells.every((c) => !c.trim())) return true;
  return SKIP_ROW_KEYWORDS.some((kw) => text.includes(kw));
}

/** Extracts charge rows from a raw HTML <table> string. */
export function parseTableHtml(html: string): ParsedRow[] {
  const root = parseHtml(html);
  const rows = root.querySelectorAll("tr");
  if (rows.length === 0) return [];

  const allRows = rows.map((r) =>
    r.querySelectorAll("td, th").map((c) => c.text.replace(/\s+/g, " ").trim())
  );

  // Find the header row — prefer <th> row first, then keyword scan
  let headerRowIdx = -1;
  let descIdx = -1;
  let amtIdx = -1;

  // Check if first row contains <th> elements (most reliable header signal)
  const firstRowNode = root.querySelectorAll("tr")[0];
  if (firstRowNode && firstRowNode.querySelectorAll("th").length > 0) {
    headerRowIdx = 0;
    descIdx = findColumnIndex(allRows[0], DESCRIPTION_ALIASES);
    amtIdx = findColumnIndex(allRows[0], AMOUNT_ALIASES);
    // If column names not recognized, fall back to positional guess
    if (descIdx === -1) descIdx = 0;
    if (amtIdx === -1) amtIdx = allRows[0].length - 1;
  } else {
    // No <th> — scan first few rows for keyword-based header detection
    for (let i = 0; i < Math.min(allRows.length, 3); i++) {
      if (isHeaderRow(allRows[i])) {
        descIdx = findColumnIndex(allRows[i], DESCRIPTION_ALIASES);
        amtIdx = findColumnIndex(allRows[i], AMOUNT_ALIASES);
        if (descIdx !== -1 || amtIdx !== -1) {
          headerRowIdx = i;
          break;
        }
      }
    }
  }

  // Fallback: no header found — assume first column = description, last = amount
  if (headerRowIdx === -1) {
    const maxCols = Math.max(...allRows.map((r) => r.length));
    if (maxCols < 2) return [];
    descIdx = 0;
    amtIdx = maxCols - 1;
  }

  const results: ParsedRow[] = [];
  const dataRows = headerRowIdx === -1 ? allRows : allRows.slice(headerRowIdx + 1);

  for (const cells of dataRows) {
    if (isSkipRow(cells)) continue;

    const desc = descIdx !== -1 && descIdx < cells.length ? cells[descIdx] : "";
    const amtRaw = amtIdx !== -1 && amtIdx < cells.length ? cells[amtIdx] : "";

    if (!desc) continue;

    results.push({
      description: desc,
      amount: parseAmount(amtRaw),
    });
  }

  return results;
}
