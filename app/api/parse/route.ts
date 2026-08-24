import { NextRequest, NextResponse } from "next/server";
import { parseFile, isParserReady } from "@/src/lib/parser";
import { extractBill } from "@/src/lib/extractor/BillExtractor";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "PARSE_FAILED", message: "Could not read the request body." }, { status: 400 });
  }

  const file = formData.get("pdf") as File | null;

  if (!file) {
    return NextResponse.json({ error: "NO_FILE", message: "No PDF file found in the request." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "FILE_TOO_LARGE", message: "File exceeds the 20 MB limit." }, { status: 400 });
  }

  try {
    const result = await parseFile(file);

    if (!result.has_text_layer) {
      return NextResponse.json(
        {
          error: "NO_TEXT_LAYER",
          message: "This PDF appears to be a scanned document without a text layer. Extraction is not supported.",
          metadata: {
            pages: result.pages,
            hasTextLayer: result.has_text_layer,
            producer: result.producer,
          },
        },
        { status: 422 }
      );
    }

    const bill = extractBill(result, file.name);
    return NextResponse.json(bill);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("pdf") || message.toLowerCase().includes("engine")) {
      return NextResponse.json(
        { error: "PARSE_FAILED", message: "Could not open the file as a PDF. It may be corrupted or encrypted." },
        { status: 400 }
      );
    }
    console.error("[/api/parse]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred." }, { status: 500 });
  }
}
