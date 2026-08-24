"use client";

import { useState } from "react";

export interface ParsedDocument {
  name: string;
  pages: number;
  blockCount: number;
  text: string;
}

export interface ParseFailure {
  name: string;
  error: string;
}

export interface BatchParseResult {
  total: number;
  succeeded: number;
  failed: number;
  documents: ParsedDocument[];
  failures: ParseFailure[];
}

export function useParseBatch() {
  const [parseResult, setParseResult] = useState<BatchParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [answer, setAnswer] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  async function parseBatch(files: File[]) {
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);
    setAnswer(null);

    const form = new FormData();
    files.forEach((f) => form.append("pdf", f));

    try {
      const res = await fetch("/api/batch-parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.message ?? "Batch parse failed.");
      } else {
        setParseResult(data as BatchParseResult);
      }
    } catch {
      setParseError("Connection failed. Please check your internet and try again.");
    } finally {
      setIsParsing(false);
    }
  }

  async function askQuestion(question: string) {
    if (!parseResult?.documents.length) return;
    setIsQuerying(true);
    setQueryError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/batch-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          documents: parseResult.documents.map(({ name, text }) => ({ name, text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQueryError(data.message ?? "Query failed.");
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setQueryError("Connection failed. Please check your internet and try again.");
    } finally {
      setIsQuerying(false);
    }
  }

  function reset() {
    setParseResult(null);
    setParseError(null);
    setAnswer(null);
    setQueryError(null);
  }

  return { parseBatch, parseResult, isParsing, parseError, askQuestion, answer, isQuerying, queryError, reset };
}

