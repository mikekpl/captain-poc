import { v4 as uuidv4 } from "uuid";
import { parse as parseHtml } from "node-html-parser";
import {
  ParsedBill, AccountInfo, BillingSummary,
  ChargeLineItem, ChargeGroup, ChargeCategory,
} from "@/src/lib/types";
import { parseAmount } from "./amountParser";
import { parseTableHtml } from "./tableParser";
import { classifyCharge } from "./ChargeClassifier";

interface Block { type: string; content: string; page: number; left: number; top: number; width: number; height: number; }
interface ParseResult { pages: number; has_text_layer: boolean; producer: string | null; blocks: Block[]; }

const KNOWN_ISSUERS = ["Globe","PLDT","Smart","Meralco","Converge","Sky","Dito"];
const SECTION_CHARGE_RE = /charge|fee|service|bill|subscription|detail|plan summary/i;
const TOTAL_LABELS = ["(total amount due)","total amount due","amount due","total due","total payable","balance due","please pay","amount to pay"];
const PREV_BAL_LABELS = ["previous bill amount","previous balance","prior balance","balance forward"];
const CURR_CHARGES_LABELS = ["total charge","current charges","charges this period","total charges"];
const SERVICE_NO_LABELS = ["primary number","mobile number","service number","contact number","msisdn"];
const DATE_RANGE_RE = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+to\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;
const STANDALONE_DATE_RE = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/;
const NAME_TITLE_RE = /^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Engr\.?|Atty\.?)\s+/i;
const ACCT_NUM_RE = /^\d{7,15}$/;
const INLINE_AMOUNT_RE = /^(.+?)\s+(?:Php\s+|PHP\s+|P\s+|₱|[$€£])\s*([\d,]+\.?\d{0,2})\s*$/;

function matchesLabel(text: string, labels: string[]): boolean {
  const lower = text.toLowerCase().trim();
  return labels.some((l) => lower.includes(l.toLowerCase()));
}

function extractDate(text: string): string | null {
  const m = text.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (!m) return null;
  let [, a, b, c] = m;
  if (c.length === 2) c = "20" + c;
  const d = new Date(`${a}/${b}/${c}`);
  return isNaN(d.getTime()) ? `${a}/${b}/${c}` : d.toISOString().split("T")[0];
}

function buildSectionMap(blocks: Block[]): Map<string, Block[]> {
  const sections = new Map<string, Block[]>();
  let cur = "header";
  sections.set(cur, []);
  for (const b of blocks) {
    if (b.type === "Section Header" || b.type === "Header") {
      cur = b.content.toLowerCase().trim();
      if (!sections.has(cur)) sections.set(cur, []);
    } else {
      sections.get(cur)!.push(b);
    }
  }
  return sections;
}

function detectIssuer(blocks: Block[]) {
  for (const b of blocks.filter((b) => b.page === 1)) {
    for (const name of KNOWN_ISSUERS) {
      if (b.content.toLowerCase().includes(name.toLowerCase()))
        return { issuer: name, issuerConfidence: 1.0 };
    }
  }
  return { issuer: null, issuerConfidence: 0 };
}

function extractAccountInfo(blocks: Block[]): AccountInfo {
  let accountNumber: string | null = null;
  let accountName: string | null = null;
  let address: string | null = null;
  let serviceNumber: string | null = null;
  let matched = 0;

  for (const b of blocks.filter((b) => b.type === "Header")) {
    if (!accountNumber && ACCT_NUM_RE.test(b.content.trim())) { accountNumber = b.content.trim(); matched++; }
  }
  for (const b of blocks.filter((b) => b.type === "Section Header")) {
    if (!accountName && NAME_TITLE_RE.test(b.content.trim())) { accountName = b.content.trim(); matched++; }
  }
  for (const b of blocks.filter((b) => b.type === "Key Value")) {
    const text = b.content; const val = () => text.split(/[:=]\s*/)[1]?.trim() ?? null;
    if (!accountNumber && /account.*(no|number|#)/i.test(text)) { const v = val(); if (v) { accountNumber = v.split(/\s/)[0]; matched++; } }
    if (!accountName && /account.*name|customer.*name|subscriber/i.test(text)) { accountName = val(); if (accountName) matched++; }
    if (!address && /address/i.test(text)) address = val();
    if (!serviceNumber && matchesLabel(text, SERVICE_NO_LABELS)) serviceNumber = val();
  }
  for (const t of blocks.filter((b) => b.type === "Table" && b.page === 1)) {
    const cells = parseHtml(t.content).querySelectorAll("td, th").map((c) => c.text.replace(/\s+/g, " ").trim());
    for (const cell of cells) {
      if (!accountNumber && /account number/i.test(cell)) {
        const num = cell.replace(/account number/gi, "").trim().split(/\s/)[0];
        if (num && ACCT_NUM_RE.test(num)) accountNumber = num;
      }
      if (!serviceNumber && matchesLabel(cell, SERVICE_NO_LABELS)) {
        const cleaned = cell.replace(new RegExp(SERVICE_NO_LABELS.join("|"), "gi"), "").trim().split(/\s/)[0];
        if (cleaned) serviceNumber = cleaned;
      }
    }
  }
  const confidence = matched >= 2 ? "high" : matched === 1 ? "medium" : "low";
  return { accountNumber, accountName, address, serviceNumber, confidence };
}

function extractBillingSummary(blocks: Block[]): BillingSummary {
  let billingPeriodStart: string | null = null;
  let billingPeriodEnd: string | null = null;
  let dueDate: string | null = null;
  let totalDue: number | null = null;
  let previousBalance: number | null = null;
  let currentCharges: number | null = null;
  let amountPaid: number | null = null;
  let matched = 0;

  for (const b of blocks.filter((b) => b.type === "Section Header")) {
    const text = b.content.trim();
    const range = text.match(DATE_RANGE_RE);
    if (!billingPeriodStart && range) { billingPeriodStart = extractDate(range[1]); billingPeriodEnd = extractDate(range[2]); matched++; continue; }
    if (!dueDate && STANDALONE_DATE_RE.test(text)) { dueDate = extractDate(text); if (dueDate) matched++; }
  }
  for (const t of blocks.filter((b) => b.type === "Table")) {
    const rows = parseHtml(t.content).querySelectorAll("tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td, th").map((c) => c.text.replace(/\s+/g, " ").trim());
      if (cells.length < 2) continue;
      const label = cells[0];
      if (totalDue === null && matchesLabel(label, TOTAL_LABELS)) {
        for (let i = 1; i < cells.length; i++) { const v = parseAmount(cells[i]); if (v !== null && v > 0) { totalDue = v; matched++; break; } }
      }
      if (previousBalance === null && matchesLabel(label, PREV_BAL_LABELS)) { const v = parseAmount(cells[cells.length-1]); if (v !== null) previousBalance = v; }
      if (currentCharges === null && matchesLabel(label, CURR_CHARGES_LABELS)) { const v = parseAmount(cells[cells.length-1]); if (v !== null) currentCharges = v; }
      if (amountPaid === null && /^payment$/i.test(label.trim()) && cells.length >= 2) { const v = parseAmount(cells[cells.length-1]); if (v !== null) amountPaid = v; }
    }
  }
  for (const b of blocks.filter((b) => b.type === "Key Value" || b.type === "Text")) {
    const text = b.content;
    if (!dueDate && /due date|pay by/i.test(text)) { const d = extractDate(text); if (d) { dueDate = d; matched++; } }
    if (totalDue === null && matchesLabel(text, TOTAL_LABELS)) { const v = parseAmount(text.split(/[:=]\s*/)[1] ?? ""); if (v !== null) { totalDue = v; matched++; } }
    if (currentCharges === null && matchesLabel(text, CURR_CHARGES_LABELS)) { const v = parseAmount(text.split(/[:=]\s*/)[1] ?? ""); if (v !== null) currentCharges = v; }
  }
  const confidence = matched >= 2 ? "high" : matched === 1 ? "medium" : "low";
  return { billingPeriodStart, billingPeriodEnd, dueDate, totalDue, currency: "PHP", previousBalance, currentCharges, amountPaid, confidence };
}

function extractCharges(sectionMap: Map<string, Block[]>, allBlocks: Block[]): ChargeLineItem[] {
  const results: ChargeLineItem[] = [];
  const seen = new Set<string>();

  const chargeBlocks: Block[] = [];
  for (const [key, blocks] of Array.from(sectionMap.entries())) {
    if (SECTION_CHARGE_RE.test(key)) chargeBlocks.push(...blocks);
  }
  const target = chargeBlocks.length > 0 ? chargeBlocks : allBlocks;

  function addCharge(desc: string, amount: number, page: number, srcType: string) {
    const key = `${desc}|${amount}`;
    if (seen.has(key)) return;
    seen.add(key);
    const { category, explanation, confidence } = classifyCharge(desc, amount);
    results.push({ id: uuidv4(), description: desc, amount, quantity: null, rate: null, page, sourceBlockType: srcType, category, explanation, confidence });
  }

  for (const b of target.filter((b) => b.type === "Table")) {
    for (const row of parseTableHtml(b.content)) {
      if (row.description && row.amount !== null) addCharge(row.description, row.amount, b.page, "Table");
    }
  }
  if (results.length === 0) {
    for (const b of target.filter((b) => b.type === "List Item" || b.type === "Text")) {
      const m = b.content.match(INLINE_AMOUNT_RE);
      if (m) { const amt = parseAmount(m[2]); if (m[1] && amt !== null) addCharge(m[1].trim(), amt, b.page, b.type); }
    }
  }
  return results;
}

function groupCharges(items: ChargeLineItem[]): ChargeGroup[] {
  const map = new Map<ChargeCategory, ChargeLineItem[]>();
  for (const item of items) { if (!map.has(item.category)) map.set(item.category, []); map.get(item.category)!.push(item); }
  return Array.from(map.entries()).map(([category, catItems]) => ({ category, totalAmount: catItems.reduce((s, i) => s + i.amount, 0), items: catItems }));
}

export function extractBill(result: ParseResult, filename: string): ParsedBill {
  const start = Date.now();
  const { issuer, issuerConfidence } = detectIssuer(result.blocks);
  const sectionMap = buildSectionMap(result.blocks);
  const account = extractAccountInfo(result.blocks);
  const billingSummary = extractBillingSummary(result.blocks);
  const rawCharges = extractCharges(sectionMap, result.blocks);
  const charges = groupCharges(rawCharges);
  return {
    id: uuidv4(), filename, parsedAt: new Date().toISOString(),
    source: { issuer, issuerConfidence, pdfProducer: result.producer, pages: result.pages, hasTextLayer: result.has_text_layer },
    account, billingSummary, charges, rawCharges,
    metadata: { pages: result.pages, hasTextLayer: result.has_text_layer, producer: result.producer, blockCount: result.blocks.length, tableBlockCount: result.blocks.filter((b) => b.type === "Table").length, extractionDurationMs: Date.now() - start },
  };
}
