"use client";

import { BillComparison } from "@/src/lib/types";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonViewProps {
  comparison: BillComparison;
}

function fmtAmount(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
}

function fmtDate(val: string | null) {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-PH", { month: "short", year: "numeric" }); }
  catch { return val; }
}

const STATUS_VARIANT: Record<string, "green" | "red" | "amber" | "gray"> = {
  new: "green",
  removed: "red",
  changed: "amber",
  unchanged: "gray",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Same",
};

export function ComparisonView({ comparison }: ComparisonViewProps) {
  const { billA, billB, delta, totalDueDiff } = comparison;
  const diffIsPositive = totalDueDiff !== null && totalDueDiff > 0;
  const diffIsNegative = totalDueDiff !== null && totalDueDiff < 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Bill A</p>
            <p className="font-semibold text-gray-800 truncate">{billA.filename}</p>
            <p className="text-xs text-gray-400">{fmtDate(billA.billingSummary.billingPeriodStart)}</p>
            <p className="text-xl font-bold text-gray-900">{fmtAmount(billA.billingSummary.totalDue)}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            {diffIsPositive && <TrendingUp className="h-6 w-6 text-red-500" />}
            {diffIsNegative && <TrendingDown className="h-6 w-6 text-emerald-500" />}
            {!diffIsPositive && !diffIsNegative && <Minus className="h-6 w-6 text-gray-400" />}
            <p className={`text-sm font-semibold ${diffIsPositive ? "text-red-600" : diffIsNegative ? "text-emerald-600" : "text-gray-500"}`}>
              {totalDueDiff !== null ? fmtAmount(totalDueDiff) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Bill B</p>
            <p className="font-semibold text-gray-800 truncate">{billB.filename}</p>
            <p className="text-xs text-gray-400">{fmtDate(billB.billingSummary.billingPeriodStart)}</p>
            <p className="text-xl font-bold text-gray-900">{fmtAmount(billB.billingSummary.totalDue)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Delta table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Charge</th>
              <th className="px-3 py-3 text-right">Bill A</th>
              <th className="px-3 py-3 text-right">Bill B</th>
              <th className="px-3 py-3 text-right">Diff</th>
              <th className="px-3 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {delta.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{d.description}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-600">{fmtAmount(d.amountA)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-600">{fmtAmount(d.amountB)}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${d.diff !== null && d.diff > 0 ? "text-red-600" : d.diff !== null && d.diff < 0 ? "text-emerald-600" : "text-gray-400"}`}>
                  {d.diff !== null ? fmtAmount(d.diff) : "—"}
                </td>
                <td className="px-3 py-2 text-center">
                  <Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
