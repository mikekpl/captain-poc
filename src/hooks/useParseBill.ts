"use client";

import { useState } from "react";
import { ParsedBill, ParseError } from "@/src/lib/types";

export function useParseBill() {
  const [result, setResult] = useState<ParsedBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ParseError | null>(null);

  async function parseBill(file: File) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("pdf", file);

    try {
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError({
          code: data.error ?? "INTERNAL_ERROR",
          message: data.message ?? "Something went wrong.",
          metadata: data.metadata,
        } as ParseError);
      } else {
        setResult(data as ParsedBill);
      }
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Connection failed. Please check your internet and try again." });
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return { parseBill, result, isLoading, error, reset };
}
