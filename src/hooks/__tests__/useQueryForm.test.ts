import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQueryForm } from "../useQueryForm";
import { QUERY_FORM_DEFAULTS } from "@/src/lib/captainTypes";

const MOCK_RESPONSE = {
  query: "test",
  results: [{ chunk_id: "c1", score: 0.9, text: "Answer text", modality: "text", match_sources: [], document: { id: "d1", filename: "doc.pdf", source: { type: "upload", uri: null, mime_type: null } }, location: { page_start: null, page_end: null, time_start: null, time_end: null, row: null, col: null } }],
  total_results: 1, limit: 20, rerank: { used: false, reason: "disabled" as const }, execution_time_ms: 50, request_id: "r1",
};

beforeEach(() => { vi.restoreAllMocks(); });

describe("useQueryForm", () => {
  it("initializes with default form state and no response", () => {
    const { result } = renderHook(() => useQueryForm());
    expect(result.current.form).toEqual(QUERY_FORM_DEFAULTS);
    expect(result.current.response).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets isLoading true during submit and resolves on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(MOCK_RESPONSE), { status: 200 })
    );
    const { result } = renderHook(() => useQueryForm());

    await act(async () => { result.current.setQuery("test query"); });

    let loadingDuring = false;
    await act(async () => {
      const p = result.current.submit();
      loadingDuring = result.current.isLoading;
      await p;
    });

    expect(result.current.response).toMatchObject({ query: "test" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets NETWORK_ERROR when fetch rejects", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network fail"));
    const { result } = renderHook(() => useQueryForm());

    await act(async () => { result.current.setQuery("test"); });
    await act(async () => { await result.current.submit(); });

    expect(result.current.error?.code).toBe("NETWORK_ERROR");
    expect(result.current.response).toBeNull();
  });

  it("sets VALIDATION_ERROR when query is empty", async () => {
    const { result } = renderHook(() => useQueryForm());
    await act(async () => { await result.current.submit(); });
    expect(result.current.error?.code).toBe("VALIDATION_ERROR");
  });

  it("reset clears response and error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useQueryForm());

    await act(async () => { result.current.setQuery("test"); });
    await act(async () => { await result.current.submit(); });
    expect(result.current.error).not.toBeNull();

    act(() => { result.current.reset(); });
    expect(result.current.error).toBeNull();
    expect(result.current.response).toBeNull();
  });
});
