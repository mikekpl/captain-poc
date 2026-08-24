import { ChargeCategory, CATEGORY_META } from "@/src/lib/types";

const KEYWORD_MAP: Record<ChargeCategory, string[]> = {
  "base-plan": [
    "base plan", "monthly service", "plan fee", "recurring charge",
    "standard service", "base rate", "postpaid plan", "prepaid plan",
    "monthly plan", "subscription fee", "plan charge",
  ],
  "data-internet": [
    "data", "gb", "mb", "broadband", "internet", "high-speed",
    "data add-on", "data addon", "mobile data", "data overage",
    "lte", "5g", "4g", "wifi", "bandwidth",
  ],
  "voice-calls": [
    "voice", "call", "minutes", "long distance", "ld charges",
    "international call", "roaming call", "airtime", "talk",
    "outgoing", "incoming call",
  ],
  "sms-messaging": [
    "sms", "text", "mms", "messaging", "picture message",
    "short message", "message service",
  ],
  // taxes-fees must appear before service-addons: "value added tax" would otherwise
  // match service-addons' "value added" keyword first
  "taxes-fees": [
    "value added tax", "tax", "vat", "e-vat", "regulatory", "government",
    "universal service", "fcc", "state tax", "local tax", "sales tax",
    "excise", "surcharge", "levy", "withholding",
  ],
  "service-addons": [
    "add-on", "addon", "premium", "msvs", "vas", "value added service",
    "feature", "voicemail", "caller id", "call waiting",
    "roaming", "international roaming", "subscription", "promo",
    "entertainment", "content", "streaming",
  ],
  "adjustments-credits": [
    "credit", "adjustment", "discount", "promotion", "rebate",
    "waiver", "refund", "reversal", "autopay", "loyalty",
    "goodwill", "correction", "reversal",
  ],
  other: [],
};

const PATTERN_MAP: Record<ChargeCategory, RegExp[]> = {
  "base-plan": [/monthly.*plan/i, /plan.*\d+/i, /service.*base/i],
  "data-internet": [/\d+\s*gb/i, /unlimited.*data/i, /data.*pack/i],
  "voice-calls": [/\d+\s*min/i, /unlimited.*talk/i, /voice.*pack/i],
  "sms-messaging": [/\d+\s*sms/i, /unlimited.*text/i],
  "service-addons": [/add[-\s]?on/i, /vas\b/i, /msvs/i],
  "taxes-fees": [/\d+(\.\d+)?%.*tax/i, /tax\b/i, /\bfee\b/i],
  "adjustments-credits": [/^credit/i, /-\s*[\₱$]/, /discount/i],
  other: [],
};

export interface ClassificationResult {
  category: ChargeCategory;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

export function classifyCharge(
  description: string,
  _amount: number | null
): ClassificationResult {
  const lower = description.toLowerCase();

  // Pass 1: exact keyword substring match
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP) as [ChargeCategory, string[]][]) {
    if (cat === "other") continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return {
          category: cat,
          explanation: buildExplanation(cat, description),
          confidence: "high",
        };
      }
    }
  }

  // Pass 2: regex pattern match
  for (const [cat, patterns] of Object.entries(PATTERN_MAP) as [ChargeCategory, RegExp[]][]) {
    if (cat === "other") continue;
    for (const re of patterns) {
      if (re.test(lower)) {
        return {
          category: cat,
          explanation: buildExplanation(cat, description),
          confidence: "medium",
        };
      }
    }
  }

  return {
    category: "other",
    explanation: CATEGORY_META["other"].explanation,
    confidence: "low",
  };
}

function buildExplanation(cat: ChargeCategory, description: string): string {
  const base = CATEGORY_META[cat].explanation;
  // For add-ons, personalize slightly with the raw description
  if (cat === "service-addons") {
    return `A subscribed add-on or value-added service: "${description}". ${base}`;
  }
  return base;
}
