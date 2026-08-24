"use client";

import { useState } from "react";
import { ChargeGroup, CATEGORY_META } from "@/src/lib/types";
import { ChargeLine } from "@/src/components/ChargeLine/ChargeLine";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ChargesSectionProps {
  groups: ChargeGroup[];
}

function fmtAmount(val: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
}

function GroupRow({ group }: { group: ChargeGroup }) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_META[group.category];
  const isCredit = group.totalAmount < 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="font-semibold text-gray-800">{meta.label}</span>
          <span className="text-xs text-gray-400">({group.items.length} item{group.items.length !== 1 ? "s" : ""})</span>
        </div>
        <span className={`text-sm font-bold tabular-nums ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
          {fmtAmount(group.totalAmount)}
        </span>
      </button>

      {open && (
        <div className="divide-y divide-gray-50 border-t border-gray-100 px-1 pb-1">
          {group.items.map((item) => (
            <ChargeLine key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChargesSection({ groups }: ChargesSectionProps) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
        No charges were extracted from this PDF.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Charges Breakdown</h2>
      {groups.map((g) => (
        <GroupRow key={g.category} group={g} />
      ))}
    </div>
  );
}
