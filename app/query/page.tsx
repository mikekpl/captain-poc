"use client";

import { useRef, useEffect } from "react";
import { useQueryForm } from "@/src/hooks/useQueryForm";
import { QueryForm } from "@/src/components/QueryUI/QueryForm";
import { TopAnswerCard } from "@/src/components/QueryUI/TopAnswerCard";
import { ResultsList } from "@/src/components/QueryUI/ResultsList";
import { QuerySkeleton } from "@/src/components/QueryUI/QuerySkeleton";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { SearchX, RefreshCw, AlertCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Please enter a question before searching.",
  API_ERROR: "The search service returned an error. Please try again.",
  TIMEOUT: "The search service took too long to respond. Please try again.",
  NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
  INTERNAL_ERROR: "Something went wrong on our end. Please try again.",
};

export default function QueryPage() {
  const { form, setQuery, setLimit, setRerank, setCollectionId, submit, response, isLoading, error, reset } = useQueryForm();
  const topAnswerRef = useRef<HTMLDivElement>(null);

  // Move focus to top answer on successful response for accessibility
  useEffect(() => {
    if (response?.results?.length) {
      topAnswerRef.current?.focus();
    }
  }, [response]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Query</h1>
        <p className="mt-1 text-sm text-gray-500">Ask a question — get the most relevant answers from the collection.</p>
      </div>

      <QueryForm
        form={form}
        setQuery={setQuery}
        setLimit={setLimit}
        setRerank={setRerank}
        setCollectionId={setCollectionId}
        onSubmit={submit}
        isLoading={isLoading}
      />

      <div className="mt-8" aria-live="polite" aria-atomic="false">
        {isLoading && <QuerySkeleton />}

        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="font-semibold text-gray-800">
                {ERROR_MESSAGES[error.code] ?? error.message}
              </p>
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {response && !isLoading && (
          <div className="space-y-6">
            {response.results.length === 0 ? (
              <Card className="border-dashed border-gray-200">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <SearchX className="h-10 w-10 text-gray-300" />
                  <p className="text-gray-500">No results found for your query.</p>
                  <Button variant="outline" size="sm" onClick={reset}>Try a different question</Button>
                </CardContent>
              </Card>
            ) : (
              <>  
                <div ref={topAnswerRef} tabIndex={-1} className="outline-none">
                  <TopAnswerCard
                    result={response.results[0]}
                    rerankUsed={response.rerank.used}
                    aiAnswer={response.aiAnswer}
                  />
                </div>
                <ResultsList
                  results={response.results}
                  rerankUsed={response.rerank.used}
                  aiNotes={response.aiNotes}
                />
                <p className="text-center text-xs text-gray-400">
                  {response.total_results} result{response.total_results !== 1 ? "s" : ""} · {response.execution_time_ms}ms
                  {response.rerank.used && " · Reranked"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
