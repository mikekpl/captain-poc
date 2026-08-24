import { describe, it, expect } from "vitest";
import { parseTableHtml } from "../tableParser";

const TABLE_WITH_HEADERS = `
<table>
  <tr><th>Description</th><th>Amount</th></tr>
  <tr><td>Postpaid Plan 599</td><td>₱599.00</td></tr>
  <tr><td>Data Add-on</td><td>₱150.00</td></tr>
</table>`;

const TABLE_NO_HEADERS = `
<table>
  <tr><td>Unli Call Pack</td><td>99.00</td></tr>
  <tr><td>SMS Bundle</td><td>29.00</td></tr>
</table>`;

const TABLE_PESO_SYMBOL = `
<table>
  <tr><th>Charge</th><th>Total</th></tr>
  <tr><td>VAT</td><td>₱71.88</td></tr>
</table>`;

const TABLE_NEGATIVE_PARENS = `
<table>
  <tr><th>Description</th><th>Amount</th></tr>
  <tr><td>Autopay Discount</td><td>(50.00)</td></tr>
</table>`;

describe("parseTableHtml", () => {
  it("extracts rows with standard headers", () => {
    const rows = parseTableHtml(TABLE_WITH_HEADERS);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ description: "Postpaid Plan 599", amount: 599 });
    expect(rows[1]).toMatchObject({ description: "Data Add-on", amount: 150 });
  });

  it("extracts rows without header row", () => {
    const rows = parseTableHtml(TABLE_NO_HEADERS);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].description).toBeTruthy();
  });

  it("handles ₱ currency symbol", () => {
    const rows = parseTableHtml(TABLE_PESO_SYMBOL);
    expect(rows[0]).toMatchObject({ description: "VAT", amount: 71.88 });
  });

  it("handles negative amount in parentheses", () => {
    const rows = parseTableHtml(TABLE_NEGATIVE_PARENS);
    expect(rows[0]).toMatchObject({ description: "Autopay Discount", amount: -50 });
  });

  it("returns empty array for empty table", () => {
    expect(parseTableHtml("<table></table>")).toHaveLength(0);
  });
});
