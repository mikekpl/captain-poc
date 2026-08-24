import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Bot } from "lucide-react";

interface AiAnswerCardProps {
  answer: string;
}

export function AiAnswerCard({ answer }: AiAnswerCardProps) {
  return (
    <Card className="border-2 border-violet-200 bg-violet-50 shadow-sm" data-testid="ai-answer-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-violet-700 font-semibold">
          <Bot className="h-4 w-4" />
          <span>AI Answer</span>
          <span className="ml-auto text-xs font-normal text-violet-400">gemini-3.6-flash</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-violet-600 prose-strong:text-gray-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
