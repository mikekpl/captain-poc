"use client";

import { useState } from "react";
import { ParsedBill } from "@/src/lib/types";
import { useParseBill } from "@/src/hooks/useParseBill";
import { useBillHistory } from "@/src/hooks/useBillHistory";
import { computeComparison } from "@/src/lib/extractor/BillCompare";
import { UploadZone } from "@/src/components/UploadZone/UploadZone";
import { BillDashboard, BillDashboardSkeleton } from "@/src/components/BillDashboard/BillDashboard";
import { ComparisonView } from "@/src/components/ComparisonView/ComparisonView";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ArrowLeft, Trash2, GitCompare, X, ScanLine } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  NO_FILE: "Please select a PDF file to upload.",
  FILE_TOO_LARGE: "Your PDF is over 20 MB. Please try a smaller file.",
  PARSE_FAILED: "We couldn't read this PDF. It may be password-protected or damaged.",
  NO_TEXT_LAYER: "This PDF looks like a scanned image. We can only read digital PDFs with a text layer.",
  NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
  INTERNAL_ERROR: "Something went wrong on our end. Please try again.",
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return iso; }
}

function fmtAmount(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
}

export default function Home() {
  const { parseBill, result, isLoading, error, reset } = useParseBill();
  const { bills, saveBill, removeBill } = useBillHistory();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  if (result && result.id !== lastSavedId) {
    saveBill(result);
    setLastSavedId(result.id);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  }

  const billA = bills.find((b) => b.id === selectedIds[0]);
  const billB = bills.find((b) => b.id === selectedIds[1]);
  const comparison = billA && billB ? computeComparison(billA, billB) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Page intro — only shown on the upload/idle state */}
      {!result && !isLoading && !error && (
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">PDF Bill Parser</h1>
          <p className="mt-1.5 text-gray-500">Upload any billing PDF and understand every charge — instantly.</p>
        </div>
      )}

      {/* Upload zone */}
      {!result && !isLoading && !error && (
        <UploadZone onFile={parseBill} disabled={isLoading} />
      )}

      {isLoading && <BillDashboardSkeleton />}

      {/* Error state — static classes so Tailwind doesn't purge them */}
      {error && !isLoading && (
        <div className="space-y-4">
          {error.code === "NO_TEXT_LAYER" ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <ScanLine className="h-10 w-10 text-amber-400" />
                <p className="font-semibold text-gray-800">{ERROR_MESSAGES.NO_TEXT_LAYER}</p>
                <Button variant="outline" onClick={reset}>Try another file</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <X className="h-10 w-10 text-red-400" />
                <p className="font-semibold text-gray-800">{ERROR_MESSAGES[error.code] ?? error.message}</p>
                <Button variant="outline" onClick={reset}>Try another file</Button>
              </CardContent>
            </Card>
          )}
          <UploadZone onFile={parseBill} />
        </div>
      )}

      {/* Result dashboard */}
      {result && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Parse another
            </Button>
          </div>
          <ErrorBoundary>
            <BillDashboard bill={result} />
          </ErrorBoundary>
        </div>
      )}

      {/* Bill history */}
      {bills.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              History <span className="ml-1 text-sm font-normal text-gray-400">({bills.length})</span>
            </h2>
            <Button
              variant={compareMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => { setCompareMode((v) => !v); setSelectedIds([]); }}
            >
              <GitCompare className="mr-1 h-4 w-4" />
              {compareMode ? "Cancel" : "Compare"}
            </Button>
          </div>

          {compareMode && (
            <p className="text-sm text-blue-600">
              {selectedIds.length === 0 && "Select two bills to compare."}
              {selectedIds.length === 1 && "Select one more bill."}
              {selectedIds.length === 2 && "Showing comparison below ↓"}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {bills.map((bill) => {
              const isSelected = selectedIds.includes(bill.id);
              const selIdx = selectedIds.indexOf(bill.id);
              return (
                <div
                  key={bill.id}
                  onClick={() => compareMode && toggleSelect(bill.id)}
                  className={[
                    "group flex items-center justify-between rounded-xl border px-4 py-3 transition-colors bg-white",
                    compareMode ? "cursor-pointer hover:border-blue-400" : "",
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {compareMode && isSelected && (
                        <Badge variant="blue" className="shrink-0 text-xs">Bill {selIdx === 0 ? "A" : "B"}</Badge>
                      )}
                      <p className="truncate text-sm font-medium text-gray-800">{bill.filename}</p>
                    </div>
                    <p className="text-xs text-gray-400">{fmtDate(bill.parsedAt)} · {fmtAmount(bill.billingSummary.totalDue)}</p>
                  </div>
                  {!compareMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBill(bill.id); }}
                      className="ml-2 shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {comparison && (
            <div className="mt-6">
              <h3 className="mb-3 text-base font-semibold text-gray-800">Comparison</h3>
              <ComparisonView comparison={comparison} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
