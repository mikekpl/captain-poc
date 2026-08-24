// @ts-ignore — WASM package; types in index.d.ts
import { initParser, parsePdf } from "@captain-sdk/pdf-parser";

export type { ParseResult, Block } from "@captain-sdk/pdf-parser";

export type BatchEntry =
  | { ok: true; result: Awaited<ReturnType<typeof parsePdf>> }
  | { ok: false; error: string };

let initialized = false;

export async function ensureParser(): Promise<void> {
  if (!initialized) {
    await initParser();
    initialized = true;
  }
}

export function isParserReady(): boolean {
  return initialized;
}

export async function parseFile(file: File) {
  await ensureParser();
  const buffer = Buffer.from(await file.arrayBuffer());
  return parsePdf(buffer);
}

export async function parseBatchFiles(files: File[]): Promise<BatchEntry[]> {
  await ensureParser();
  // Use parsePdf in parallel — parsePdfBatch has WASM path issues in Next.js
  const settled = await Promise.allSettled(
    files.map(async (f) => parsePdf(Buffer.from(await f.arrayBuffer())))
  );
  return settled.map((r) =>
    r.status === "fulfilled"
      ? { ok: true as const, result: r.value }
      : { ok: false as const, error: r.reason instanceof Error ? r.reason.message : String(r.reason) }
  );
}
