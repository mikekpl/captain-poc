import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MAX_TOTAL_CHARS = 120_000;

export async function POST(request: NextRequest) {
  let body: { question?: unknown; documents?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Request body must be valid JSON." }, { status: 400 });
  }

  const { question, documents } = body;

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "question must be a non-empty string." }, { status: 400 });
  }
  if (!Array.isArray(documents) || !documents.length) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "documents must be a non-empty array." }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "AI service is not configured." }, { status: 500 });
  }

  // Build context, capping total chars to stay within model token limits
  let totalChars = 0;
  const docContext = (documents as { name: string; text: string }[])
    .map((doc, i) => {
      const remaining = MAX_TOTAL_CHARS - totalChars;
      if (remaining <= 0) return null;
      const text = (doc.text ?? "").slice(0, remaining);
      totalChars += text.length;
      return `### Document ${i + 1}: ${doc.name}\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

  const prompt = `You are a helpful assistant analyzing parsed PDF documents. Answer the user's query based only on the document contents below.

User query: "${question.trim()}"

Documents:
${docContext}

Provide a clear, concise answer. Reference specific document names and page numbers where relevant.`;

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
    return NextResponse.json({ answer: result.text?.trim() ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/batch-query]", message);
    return NextResponse.json({ error: "AI_ERROR", message: "AI service failed to generate a response." }, { status: 502 });
  }
}
