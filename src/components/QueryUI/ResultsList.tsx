"use client";

import { useState } from "react";
import { CaptainResult } from "@/src/lib/captainTypes";
import { ResultCard } from "./ResultCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResultsListProps {
  results: CaptainResult[];
  rerankUsed: boolean;
  showAll?: boolean;
  aiNotes?: Record<string, string>;
}

export function ResultsList({ results, rerankUsed, showAll = false, aiNotes }: ResultsListProps) {
  const [open, setOpen] = useState(true);
  const displayed = showAll ? results : results.slice(1);
  const label = showAll ? "Sources" : "All Results";

  if (displayed.length === 0) return null;

  return (
    <div data-testid="results-list">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-3"
        aria-expanded={open}
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {label} ({displayed.length})
      </button>

      {open && (
        <div className="space-y-2">
          {displayed.map((result, i) => (
            <ResultCard
              key={result.chunk_id}
              result={result}
              rank={showAll ? i + 1 : i + 2}
              rerankUsed={rerankUsed}
              aiNote={aiNotes?.[result.chunk_id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
