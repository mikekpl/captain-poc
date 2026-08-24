import { NextResponse } from "next/server";
import { isParserReady, ensureParser } from "@/src/lib/parser";

// Warm up the WASM engine on first request to this route
ensureParser().catch(() => null);

export async function GET() {
  const ready = isParserReady();
  return NextResponse.json(
    { status: ready ? "ok" : "initializing", parserReady: ready },
    { status: ready ? 200 : 503 }
  );
}
