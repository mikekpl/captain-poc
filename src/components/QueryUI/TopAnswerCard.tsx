import { CaptainResult, CaptainModality, effectiveScore } from "@/src/lib/captainTypes";
import { renderChunkText, needsRendering } from "@/src/lib/renderContent";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge, BadgeProps } from "@/src/components/ui/badge";
import { Sparkles, FileText, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MODALITY_COLOR: Record<CaptainModality, BadgeProps["variant"]> = {
  pdf: "blue", document: "blue", video: "purple", audio: "teal",
  image: "orange", spreadsheet: "green", text: "gray", unknown: "gray",
};

interface TopAnswerCardProps {
  result: CaptainResult;
  rerankUsed: boolean;
  aiAnswer?: string;
}

export function TopAnswerCard({ result, rerankUsed, aiAnswer }: TopAnswerCardProps) {
  const score = effectiveScore(result, rerankUsed);
  const isAi = Boolean(aiAnswer);

  return (
    <Card
      className={isAi ? "border-2 border-violet-200 bg-violet-50 shadow-sm" : "border-2 border-blue-200 bg-blue-50 shadow-sm"}
      data-testid="top-answer-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-semibold ${isAi ? "text-violet-700" : "text-blue-700"}`}>
            {isAi ? <Bot className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span>{isAi ? "AI Answer" : "Top Answer"}</span>
            {isAi && <span className="text-xs font-normal text-violet-400">gemini-3.6-flash</span>}
          </div>
          {!isAi && (
            <Badge variant="blue" className="tabular-nums">
              {score.toFixed(3)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAi ? (
          <div className="prose prose-sm prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-violet-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnswer!}</ReactMarkdown>
          </div>
        ) : needsRendering(result.text) ? (
          <div
            className="chunk-content overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderChunkText(result.text) }}
          />
        ) : (
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{result.text}</p>
        )}
        <div className={`flex items-center gap-2 text-xs text-gray-500 border-t pt-3 flex-wrap ${isAi ? "border-violet-100" : "border-blue-100"}`}>
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{result.document.filename}</span>
          <Badge variant={MODALITY_COLOR[result.modality] ?? "gray"} className="text-xs capitalize">
            {result.modality}
          </Badge>
          {result.location.page_start != null && (
            <span>p. {result.location.page_start}</span>
          )}
          {rerankUsed && (
            <Badge variant="purple" className="text-xs">Reranked</Badge>
          )}
          {result.match_sources.length > 0 && (
            <div className="flex flex-wrap gap-1 w-full pt-0.5">
              {result.match_sources.map((src) => (
                <Badge key={src} variant="outline" className="text-xs px-1.5 py-0">
                  {src.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
