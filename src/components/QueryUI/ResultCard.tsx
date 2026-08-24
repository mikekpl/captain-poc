"use client";

import { useState } from "react";
import { CaptainResult, CaptainModality, effectiveScore } from "@/src/lib/captainTypes";
import { renderChunkText, needsRendering } from "@/src/lib/renderContent";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge, BadgeProps } from "@/src/components/ui/badge";
import { ChevronDown, ChevronRight, FileText, Bot } from "lucide-react";

const MODALITY_COLOR: Record<CaptainModality, BadgeProps["variant"]> = {
  pdf: "blue",
  document: "blue",
  video: "purple",
  audio: "teal",
  image: "orange",
  spreadsheet: "green",
  text: "gray",
  unknown: "gray",
};

interface ResultCardProps {
  result: CaptainResult;
  rank: number;
  rerankUsed: boolean;
  defaultOpen?: boolean;
  aiNote?: string;
}

export function ResultCard({ result, rank, rerankUsed, defaultOpen = false, aiNote }: ResultCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const score = effectiveScore(result, rerankUsed);

  return (
    <Card className="overflow-hidden" data-testid="result-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
          {rank}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          {aiNote && (
            <p className="flex items-start gap-1.5 text-xs text-violet-700 bg-violet-50 rounded-lg px-2.5 py-1.5 mb-1">
              <Bot className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {aiNote}
            </p>
          )}
          {open ? (
            needsRendering(result.text) ? (
              <div
                className="chunk-content overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: renderChunkText(result.text) }}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.text}</p>
            )
          ) : (
            // Strip tags for the collapsed 3-line preview so raw HTML isn't visible
            <p className="text-sm text-gray-700 line-clamp-3">
              {result.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="gray" className="text-xs tabular-nums">{score.toFixed(3)}</Badge>
            <Badge variant={MODALITY_COLOR[result.modality] ?? "gray"} className="text-xs capitalize">
              {result.modality}
            </Badge>
            {result.location.page_start != null && (
              <span className="text-xs text-gray-400">p. {result.location.page_start}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
              <FileText className="h-3 w-3 shrink-0" />
              {result.document.filename}
            </span>
          </div>
          {result.match_sources.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {result.match_sources.map((src) => (
                <Badge key={src} variant="outline" className="text-xs px-1.5 py-0">
                  {src.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="shrink-0 mt-0.5 text-gray-400">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
    </Card>
  );
}
