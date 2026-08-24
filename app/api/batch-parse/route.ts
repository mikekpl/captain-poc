import { NextRequest, NextResponse } from "next/server";
import { parseBatchFiles } from "@/src/lib/parser";

const MAX_FILES = 100;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB per file
// ~30k chars per doc keeps total Gemini context reasonable
const MAX_TEXT_PER_DOC = 30_000;

/** Strip HTML tags and collapse whitespace so Gemini gets clean plain text. */
function extractPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Build a structured, AI-friendly text representation of all blocks in a document. */
function buildDocumentText(blocks: { type: string; content: string; page: number }[]): string {
  return blocks
    .filter((b) => b.type !== "Figure" && b.content.trim())
    .map((b) => {
      const text = extractPlainText(b.content);
      return text ? `[${b.type} | Page ${b.page}] ${text}` : null;
    })
    .filter(Boolean)
    .join("\n")
    .slice(0, MAX_TEXT_PER_DOC);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "PARSE_FAILED", message: "Could not read the request body." }, { status: 400 });
  }

  const files = formData.getAll("pdf") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "NO_FILES", message: "No PDF files found in the request." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "TOO_MANY_FILES", message: `Max ${MAX_FILES} files per batch.` }, { status: 400 });
  }

  const oversized = files.find((f) => f.size > MAX_SIZE);
  if (oversized) {
    return NextResponse.json({ error: "FILE_TOO_LARGE", message: `"${oversized.name}" exceeds the 20 MB limit.` }, { status: 400 });
  }

  try {
    const batchEntries = await parseBatchFiles(files);

    const documents: { name: string; pages: number; blockCount: number; text: string }[] = [];
    const failures: { name: string; error: string }[] = [];

    batchEntries.forEach((entry, i) => {
      if (entry.ok) {
        const text = buildDocumentText(entry.result.blocks);
        documents.push({ name: files[i].name, pages: entry.result.pages, blockCount: entry.result.blocks.length, text });
      } else {
        failures.push({ name: files[i].name, error: entry.error });
      }
    });

    return NextResponse.json({ total: files.length, succeeded: documents.length, failed: failures.length, documents, failures });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/batch-parse]", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: process.env.NODE_ENV === "development" ? message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
