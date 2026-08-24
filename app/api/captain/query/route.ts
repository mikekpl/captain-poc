import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const BASE_URL = "https://api.captain.dev/v3/collections";
const DEFAULT_COLLECTION_ID = "test-collection-zs5xa";

function buildCollectionUrl(collectionId: string) {
  return `${BASE_URL}/${encodeURIComponent(collectionId)}/query`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Request body must be valid JSON." }, { status: 400 });
  }

  const query = body.query;
  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "query must be a non-empty string." }, { status: 400 });
  }

  const collectionId =
    typeof body.collectionId === "string" && body.collectionId.trim()
      ? body.collectionId.trim()
      : DEFAULT_COLLECTION_ID;

  const rawLimit = typeof body.limit === "number" ? body.limit : 20;
  const limit = Math.min(100, Math.max(1, Math.floor(rawLimit)));
  const rerank = typeof body.rerank === "boolean" ? body.rerank : false;

  const apiKey = process.env.CAPTAIN_API_KEY;
  if (!apiKey) {
    console.error("[/api/captain/query] CAPTAIN_API_KEY is not set");
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Search service is not configured." }, { status: 500 });
  }

  try {
    const upstream = await fetch(buildCollectionUrl(collectionId), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query.trim(), limit, rerank }),
      // @ts-ignore — AbortSignal.timeout available in Node 18.3+
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: "API_ERROR", message: `Captain API returned ${upstream.status}.`, details: errorText, status: upstream.status },
        { status: 502 }
      );
    }

    const data = await upstream.json();

    const formattedResults = (data.results ?? []).map((r: Record<string, unknown>) => {
      const doc = r.document as Record<string, unknown> | undefined;
      const loc = r.location as Record<string, unknown> | undefined;
      return {
        chunk_id: r.chunk_id,
        score: r.score,
        text: r.text,
        filename: doc?.filename,
        modality: r.modality,
        page: loc?.page_start ?? null,
        match_sources: r.match_sources,
      };
    });

    let aiAnswer: string | undefined;
    let aiNotes: Record<string, string> | undefined;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && formattedResults.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = `You are a helpful assistant. Based on search results from a document collection, answer the user's query.

User query: "${query.trim()}"

Search results:
${JSON.stringify(formattedResults, null, 2)}

Return ONLY valid JSON in exactly this format:
{
  "answer": "A clear, concise answer synthesizing the most relevant information. Reference specific documents where helpful.",
  "notes": {
    "<chunk_id>": "One sentence explaining why this result is relevant and what it contributes"
  }
}

Include a note for every chunk_id in the results.`;

        const result = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const parsed = JSON.parse(result.text ?? "{}");
        aiAnswer = typeof parsed.answer === "string" ? parsed.answer : undefined;
        aiNotes = parsed.notes && typeof parsed.notes === "object" ? parsed.notes : undefined;
      } catch (err) {
        console.error("[/api/captain/query] Gemini error:", err);
      }
    }

    return NextResponse.json({ ...data, aiAnswer, aiNotes });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json({ error: "TIMEOUT", message: "The search service took too long to respond." }, { status: 504 });
    }
    console.error("[/api/captain/query]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred." }, { status: 500 });
  }
}

