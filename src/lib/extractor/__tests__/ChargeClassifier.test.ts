import { describe, it, expect } from "vitest";
import { classifyCharge } from "../ChargeClassifier";

describe("classifyCharge", () => {
  it("classifies base plan charges", () => {
    const { category } = classifyCharge("Postpaid Plan 599", 599);
    expect(category).toBe("base-plan");
  });

  it("classifies data charges", () => {
    const { category } = classifyCharge("Mobile Data Add-on 10GB", 150);
    expect(category).toBe("data-internet");
  });

  it("classifies voice charges", () => {
    const { category } = classifyCharge("Unlimited Voice Call Pack", 99);
    expect(category).toBe("voice-calls");
  });

  it("classifies SMS charges", () => {
    const { category } = classifyCharge("Unli SMS Bundle", 29);
    expect(category).toBe("sms-messaging");
  });

  it("classifies service add-ons", () => {
    const { category } = classifyCharge("MSVS Addon Fee", 50);
    expect(category).toBe("service-addons");
  });

  it("classifies taxes and fees", () => {
    const { category } = classifyCharge("Value Added Tax (VAT)", 71.88);
    expect(category).toBe("taxes-fees");
  });

  it("classifies credits and adjustments", () => {
    const { category } = classifyCharge("Autopay Discount", -50);
    expect(category).toBe("adjustments-credits");
  });

  it("falls back to other for unrecognized charge", () => {
    const { category } = classifyCharge("XYZ123 Unknown Charge Code", 10);
    expect(category).toBe("other");
  });

  it("is case-insensitive", () => {
    const { category } = classifyCharge("MOBILE DATA BUNDLE 5GB", 99);
    expect(category).toBe("data-internet");
  });
});
