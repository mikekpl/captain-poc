"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { QueryFormState } from "@/src/lib/captainTypes";
import { Search, Loader2 } from "lucide-react";

interface QueryFormProps {
  form: QueryFormState;
  setQuery: (q: string) => void;
  setLimit: (n: number) => void;
  setRerank: (b: boolean) => void;
  setCollectionId: (id: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function QueryForm({ form, setQuery, setLimit, setRerank, setCollectionId, onSubmit, isLoading }: QueryFormProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4" data-testid="query-form">
      <div className="space-y-1.5">
        <label htmlFor="collection-input" className="block text-sm font-medium text-gray-700">
          Collection ID
        </label>
        <input
          id="collection-input"
          type="text"
          aria-label="Collection ID"
          placeholder="test-collection-zs5xa"
          value={form.collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          disabled={isLoading}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 transition-colors font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="query-input" className="block text-sm font-medium text-gray-700">
          Question
        </label>
        <textarea
          id="query-input"
          aria-label="Question"
          rows={3}
          placeholder="e.g. What is the most common question? What charges appear most often?"
          value={form.query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 resize-none transition-colors"
        />
      </div>

      <div className="flex items-end gap-4 border-t border-gray-100 pt-3">
        <div className="space-y-1">
          <label htmlFor="limit-input" className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Limit
          </label>
          <input
            id="limit-input"
            type="number"
            aria-label="Result limit"
            min={1}
            max={100}
            step={1}
            value={form.limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10) || 1)}
            disabled={isLoading}
            className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 text-center"
          />
        </div>

        <div className="flex items-center gap-2 pb-1">
          <input
            id="rerank-toggle"
            type="checkbox"
            aria-label="Enable reranking"
            checked={form.rerank}
            onChange={(e) => setRerank(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <label htmlFor="rerank-toggle" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Rerank
          </label>
        </div>

        <Button type="submit" disabled={isLoading || !form.query.trim()} className="ml-auto">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…</>
          ) : (
            <><Search className="mr-2 h-4 w-4" /> Search</>
          )}
        </Button>
      </div>
    </form>
  );
}
