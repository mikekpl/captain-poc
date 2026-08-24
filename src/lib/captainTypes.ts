// Types for the Captain v3 collection query API

export type CaptainModality =
  | "text"
  | "pdf"
  | "document"
  | "image"
  | "audio"
  | "video"
  | "spreadsheet"
  | "unknown";

export type CaptainMatchSource =
  | "content_embedding"
  | "keyword"
  | "ocr"
  | "table"
  | "transcript"
  | "metadata"
  | "summary";

export interface CaptainQueryRequest {
  query: string;
  limit: number;
  rerank: boolean;
}

export interface CaptainDocument {
  id: string;
  filename: string;
  source: {
    type: string;
    uri: string | null;
    mime_type: string | null;
  };
}

export interface CaptainLocation {
  page_start: number | null;
  page_end: number | null;
  time_start: number | null;
  time_end: number | null;
  row: number | null;
  col: number | null;
}

export interface CaptainResultMetadata {
  vectorScore?: number;
  bm25Score?: number;
  rrfScore?: number;
}

export interface CaptainResult {
  chunk_id: string;
  score: number;
  text: string;
  modality: CaptainModality;
  match_sources: CaptainMatchSource[];
  document: CaptainDocument;
  location: CaptainLocation;
  rerank_score?: number;
  metadata?: CaptainResultMetadata;
}

export interface CaptainQueryResponse {
  query: string;
  results: CaptainResult[];
  total_results: number;
  limit: number;
  rerank: {
    used: boolean;
    reason: "requested" | "disabled" | "required_for_multimodal" | "default_for_multimodal";
  };
  warnings?: string[];
  execution_time_ms: number;
  request_id: string;
  aiAnswer?: string;
  aiNotes?: Record<string, string>;
}

export interface QueryFormState {
  query: string;
  limit: number;
  rerank: boolean;
  collectionId: string;
}

export const DEFAULT_COLLECTION_ID = "test-collection-zs5xa";

export const QUERY_FORM_DEFAULTS: QueryFormState = {
  query: "",
  limit: 10,
  rerank: true,
  collectionId: "",
};

export interface QueryError {
  code: "VALIDATION_ERROR" | "API_ERROR" | "NETWORK_ERROR" | "TIMEOUT" | "INTERNAL_ERROR";
  message: string;
  status?: number;
}

export interface QueryUIState {
  form: QueryFormState;
  response: CaptainQueryResponse | null;
  isLoading: boolean;
  error: QueryError | null;
}

export interface DisplayResult {
  result: CaptainResult;
  effectiveScore: number;
  isTop: boolean;
  rank: number;
}

/** Returns rerank_score when reranking was used, otherwise falls back to score. */
export function effectiveScore(result: CaptainResult, rerankUsed: boolean): number {
  return rerankUsed && result.rerank_score != null ? result.rerank_score : result.score;
}
