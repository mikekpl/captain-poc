"use client";

import { useState } from "react";
import {
  QueryFormState,
  QUERY_FORM_DEFAULTS,
  QueryError,
  CaptainQueryResponse,
} from "@/src/lib/captainTypes";

export function useQueryForm() {
  const [form, setForm] = useState<QueryFormState>(QUERY_FORM_DEFAULTS);
  const [response, setResponse] = useState<CaptainQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<QueryError | null>(null);

  function setQuery(query: string) {
    setForm((f) => ({ ...f, query }));
  }
  function setLimit(limit: number) {
    setForm((f) => ({ ...f, limit: Math.min(100, Math.max(1, limit)) }));
  }
  function setRerank(rerank: boolean) {
    setForm((f) => ({ ...f, rerank }));
  }
  function setCollectionId(collectionId: string) {
    setForm((f) => ({ ...f, collectionId }));
  }

  async function submit() {
    if (!form.query.trim()) {
      setError({ code: "VALIDATION_ERROR", message: "Please enter a question before searching." });
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/captain/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: form.query,
          limit: form.limit,
          rerank: form.rerank,
          collectionId: form.collectionId,
          exclude_chunk_types: ["figure", "page_header"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ code: data.error ?? "INTERNAL_ERROR", message: data.message ?? "Something went wrong.", status: res.status });
      } else {
        setResponse(data as CaptainQueryResponse);
      }
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Connection failed. Please check your internet and try again." });
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setResponse(null);
    setError(null);
  }

  return { form, setQuery, setLimit, setRerank, setCollectionId, submit, response, isLoading, error, reset };
}
