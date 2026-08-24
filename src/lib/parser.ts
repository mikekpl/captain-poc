// @ts-ignore — WASM package; types in index.d.ts
import { initParser, parsePdf, parsePdfBatch } from "@captain-sdk/pdf-parser";

export type { ParseResult, Block, BatchEntry } from "@captain-sdk/pdf-parser";

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

export async function parseBatchFiles(files: File[]) {
  await ensureParser();
  const buffers = await Promise.all(files.map(async (f) => Buffer.from(await f.arrayBuffer())));
  return parsePdfBatch(buffers, { maskPii: true });
}
