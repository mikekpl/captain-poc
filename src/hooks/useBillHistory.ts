"use client";

import { useState, useEffect, useCallback } from "react";
import { ParsedBill, BillHistoryStore } from "@/src/lib/types";

const STORAGE_KEY = "captainpdf:bills";
const MAX_BILLS = 50;

function readStore(): BillHistoryStore {
  if (typeof window === "undefined") return { version: 1, bills: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, bills: [] };
    const parsed = JSON.parse(raw) as BillHistoryStore;
    return parsed?.version === 1 ? parsed : { version: 1, bills: [] };
  } catch {
    return { version: 1, bills: [] };
  }
}

function writeStore(store: BillHistoryStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useBillHistory() {
  const [bills, setBills] = useState<ParsedBill[]>([]);

  useEffect(() => {
    setBills(readStore().bills);
  }, []);

  const saveBill = useCallback((bill: ParsedBill) => {
    setBills((prev) => {
      const filtered = prev.filter((b) => b.id !== bill.id);
      const updated = [bill, ...filtered].slice(0, MAX_BILLS);
      writeStore({ version: 1, bills: updated });
      return updated;
    });
  }, []);

  const removeBill = useCallback((id: string) => {
    setBills((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      writeStore({ version: 1, bills: updated });
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBills([]);
  }, []);

  return { bills, saveBill, removeBill, clearHistory };
}
