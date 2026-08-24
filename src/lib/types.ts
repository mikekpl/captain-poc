// ─── Core enums / unions ────────────────────────────────────────────────────

export type ChargeCategory =
  | "base-plan"
  | "data-internet"
  | "voice-calls"
  | "sms-messaging"
  | "service-addons"
  | "taxes-fees"
  | "adjustments-credits"
  | "other";

export interface ChargeCategoryMeta {
  label: string;
  color:
    | "blue"
    | "purple"
    | "green"
    | "teal"
    | "orange"
    | "red"
    | "emerald"
    | "gray";
  icon: string;
  explanation: string;
}

export const CATEGORY_META: Record<ChargeCategory, ChargeCategoryMeta> = {
  "base-plan": {
    label: "Base Plan",
    color: "blue",
    icon: "Smartphone",
    explanation: "Your monthly recurring plan subscription fee.",
  },
  "data-internet": {
    label: "Data & Internet",
    color: "purple",
    icon: "Wifi",
    explanation: "Charges for mobile data or internet usage.",
  },
  "voice-calls": {
    label: "Voice & Calls",
    color: "green",
    icon: "Phone",
    explanation: "Charges for voice calls, including local and international.",
  },
  "sms-messaging": {
    label: "SMS & Messaging",
    color: "teal",
    icon: "MessageSquare",
    explanation: "Charges for text messages sent or received.",
  },
  "service-addons": {
    label: "Service Add-ons",
    color: "orange",
    icon: "PlusCircle",
    explanation: "Optional subscribed services or value-added features.",
  },
  "taxes-fees": {
    label: "Taxes & Fees",
    color: "red",
    icon: "Landmark",
    explanation: "Government-mandated taxes and regulatory fees.",
  },
  "adjustments-credits": {
    label: "Adjustments",
    color: "emerald",
    icon: "Tag",
    explanation: "Credits, discounts, or adjustments applied to your bill.",
  },
  other: {
    label: "Other Charges",
    color: "gray",
    icon: "HelpCircle",
    explanation: "A charge that could not be automatically categorized.",
  },
};

// ─── Bill source ─────────────────────────────────────────────────────────────

export interface BillSource {
  issuer: string | null;
  issuerConfidence: number;
  pdfProducer: string | null;
  pages: number;
  hasTextLayer: boolean;
}

// ─── Account & summary ───────────────────────────────────────────────────────

export interface AccountInfo {
  accountNumber: string | null;
  accountName: string | null;
  address: string | null;
  serviceNumber: string | null;
  confidence: "high" | "medium" | "low";
}

export interface BillingSummary {
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  dueDate: string | null;
  totalDue: number | null;
  currency: string;
  previousBalance: number | null;
  currentCharges: number | null;
  amountPaid: number | null;
  confidence: "high" | "medium" | "low";
}

// ─── Charges ─────────────────────────────────────────────────────────────────

export interface ChargeLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number | null;
  rate: number | null;
  page: number;
  sourceBlockType: string;
  category: ChargeCategory;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

export interface ChargeGroup {
  category: ChargeCategory;
  totalAmount: number;
  items: ChargeLineItem[];
}

// ─── Parsed bill ─────────────────────────────────────────────────────────────

export interface PdfMetadata {
  pages: number;
  hasTextLayer: boolean;
  producer: string | null;
  blockCount: number;
  tableBlockCount: number;
  extractionDurationMs: number;
}

export interface ParsedBill {
  id: string;
  filename: string;
  parsedAt: string;
  source: BillSource;
  account: AccountInfo;
  billingSummary: BillingSummary;
  charges: ChargeGroup[];
  rawCharges: ChargeLineItem[];
  metadata: PdfMetadata;
}

// ─── Comparison (P3) ─────────────────────────────────────────────────────────

export interface ChargeDelta {
  category: ChargeCategory;
  description: string;
  amountA: number | null;
  amountB: number | null;
  diff: number | null;
  status: "new" | "removed" | "changed" | "unchanged";
}

export interface BillComparison {
  billA: ParsedBill;
  billB: ParsedBill;
  delta: ChargeDelta[];
  totalDueDiff: number | null;
}

// ─── Client error ────────────────────────────────────────────────────────────

export interface ParseError {
  code:
    | "NO_FILE"
    | "FILE_TOO_LARGE"
    | "PARSE_FAILED"
    | "NO_TEXT_LAYER"
    | "NETWORK_ERROR"
    | "INTERNAL_ERROR";
  message: string;
  metadata?: PdfMetadata;
}

// ─── localStorage schema (P3) ────────────────────────────────────────────────

export interface BillHistoryStore {
  version: 1;
  bills: ParsedBill[];
}
