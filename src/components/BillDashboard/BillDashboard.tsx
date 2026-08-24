import { ParsedBill } from "@/src/lib/types";
import { SummaryCard } from "./SummaryCard";
import { ChargesSection } from "./ChargesSection";
import { AlertTriangle } from "lucide-react";

interface BillDashboardProps {
  bill: ParsedBill;
}

export function BillDashboard({ bill }: BillDashboardProps) {
  const lowConfidence =
    bill.billingSummary.confidence === "low" || bill.account.confidence === "low";

  return (
    <div className="space-y-6">
      {lowConfidence && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Some bill details couldn&apos;t be read automatically — results may be incomplete.
            This can happen with unusual PDF layouts.
          </span>
        </div>
      )}

      <SummaryCard account={bill.account} summary={bill.billingSummary} filename={bill.filename} />
      <ChargesSection groups={bill.charges} />

      <p className="text-center text-xs text-gray-400">
        Parsed {bill.metadata.blockCount} blocks · {bill.metadata.extractionDurationMs}ms ·{" "}
        {bill.source.issuer ?? "Unknown issuer"}
      </p>
    </div>
  );
}

export function BillDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 rounded-xl bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
