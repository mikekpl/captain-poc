import { describe, it, expect } from "vitest";
import { parseAmount } from "../amountParser";

describe("parseAmount", () => {
  it("parses Philippine peso with symbol", () => {
    expect(parseAmount("₱1,234.56")).toBe(1234.56);
  });

  it("parses dollar amount", () => {
    expect(parseAmount("$99.00")).toBe(99.0);
  });

  it("parses negative amount in parentheses", () => {
    expect(parseAmount("(50.00)")).toBe(-50.0);
  });

  it("parses space-separated thousands", () => {
    expect(parseAmount("1 234,00")).toBe(1234.0);
  });

  it("returns null for non-numeric text", () => {
    expect(parseAmount("Free")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseAmount("")).toBeNull();
  });

  it("parses plain integer", () => {
    expect(parseAmount("500")).toBe(500);
  });

  it("parses negative with leading dash", () => {
    expect(parseAmount("-25.00")).toBe(-25.0);
  });
});
