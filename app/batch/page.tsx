"use client";

import React, { useState } from "react";
import { BatchUploadZone } from "@/src/components/BatchUploadZone/BatchUploadZone";
import { useParseBatch } from "@/src/hooks/useParseBatch";
import { AiAnswerCard } from "@/src/components/QueryUI/AiAnswerCard";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Search } from "lucide-react";

export default function BatchPage() {
  const { parseBatch, parseResult, isParsing, parseError, askQuestion, answer, isQuerying, queryError, reset } = useParseBatch();
  const [question, setQuestion] = useState("");

  function handleQuery(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim()) askQuestion(question.trim());
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch PDF Parser</h1>
        <p className="mt-1 text-sm text-gray-500">Parse an entire folder of PDFs and ask Gemini questions about them.</p>
      </div>

      {/* Upload zone — hidden once parsing is done */}
      {!parseResult && <BatchUploadZone onFiles={parseBatch} disabled={isParsing} />}

      {/* Parsing spinner */}
      {isParsing && (
        <div className="flex items-center justify-center gap-3 py-12 text-blue-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Parsing PDFs…</span>
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{parseError}</CardContent>
        </Card>
      )}

      {/* Results */}
      {parseResult && (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Parsed</span>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{parseResult.total} total</Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{parseResult.succeeded} succeeded</Badge>
            {parseResult.failed > 0 && <Badge variant="destructive">{parseResult.failed} failed</Badge>}
            <Button variant="ghost" size="sm" className="ml-auto text-gray-500 gap-1" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> Parse another folder
            </Button>
          </div>

          {/* Per-file list */}
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            {parseResult.documents.map(({ name, pages, blockCount }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                <span className="truncate text-sm text-gray-700">{name}</span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">
                  {pages} page{pages !== 1 ? "s" : ""} · {blockCount} blocks
                </span>
              </div>
            ))}
            {parseResult.failures.map(({ name, error }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span className="truncate text-sm text-gray-700">{name}</span>
                <span className="ml-auto max-w-[200px] truncate text-xs text-red-400 shrink-0">{error}</span>
              </div>
            ))}
          </div>

          {/* Query form — only show if at least one doc parsed successfully */}
          {parseResult.succeeded > 0 && (
            <form onSubmit={handleQuery} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Ask a question about the parsed PDFs
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleQuery(e as unknown as React.FormEvent); } }}
                placeholder="e.g. What is the total amount due across all documents?"
                rows={3}
                disabled={isQuerying}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 resize-none transition-colors"
              />
              <Button type="submit" disabled={isQuerying || !question.trim()} className="gap-2">
                {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isQuerying ? "Searching…" : "Ask"}
              </Button>
            </form>
          )}

          {/* Query error */}
          {queryError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">{queryError}</CardContent>
            </Card>
          )}

          {/* Answer */}
          {answer && <AiAnswerCard answer={answer} />}
        </div>
      )}
    </main>
  );
}

