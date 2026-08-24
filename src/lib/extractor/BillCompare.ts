import { ParsedBill, BillComparison, ChargeDelta, ChargeCategory, ChargeLineItem } from "@/src/lib/types";

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchCharges(
  itemsA: ChargeLineItem[],
  itemsB: ChargeLineItem[]
): ChargeDelta[] {
  const deltas: ChargeDelta[] = [];
  const usedB = new Set<string>();

  for (const a of itemsA) {
    const key = normalize(a.description);
    const match = itemsB.find((b) => normalize(b.description) === key && !usedB.has(b.id));

    if (match) {
      usedB.add(match.id);
      const diff = match.amount - a.amount;
      deltas.push({
        category: a.category,
        description: a.description,
        amountA: a.amount,
        amountB: match.amount,
        diff,
        status: Math.abs(diff) < 0.01 ? "unchanged" : "changed",
      });
    } else {
      deltas.push({
        category: a.category,
        description: a.description,
        amountA: a.amount,
        amountB: null,
        diff: null,
        status: "removed",
      });
    }
  }

  for (const b of itemsB) {
    if (!usedB.has(b.id)) {
      deltas.push({
        category: b.category,
        description: b.description,
        amountA: null,
        amountB: b.amount,
        diff: null,
        status: "new",
      });
    }
  }

  return deltas;
}

export function computeComparison(billA: ParsedBill, billB: ParsedBill): BillComparison {
  const delta = matchCharges(billA.rawCharges, billB.rawCharges);

  const totalDueDiff =
    billA.billingSummary.totalDue !== null && billB.billingSummary.totalDue !== null
      ? billB.billingSummary.totalDue - billA.billingSummary.totalDue
      : null;

  return { billA, billB, delta, totalDueDiff };
}
