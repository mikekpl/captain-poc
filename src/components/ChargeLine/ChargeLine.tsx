"use client";

import { ChargeLineItem, CATEGORY_META } from "@/src/lib/types";
import { Badge } from "@/src/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip";

interface ChargeLineProps {
  item: ChargeLineItem;
}

function fmtAmount(val: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
}

export function ChargeLine({ item }: ChargeLineProps) {
  const meta = CATEGORY_META[item.category];
  const isCredit = item.amount < 0;

  return (
    <TooltipProvider>
      <div
        className="charge-line flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
        data-category={item.category}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Badge variant={meta.color as never} className="shrink-0 cursor-help">
                  {meta.label}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center">
              {item.explanation}
            </TooltipContent>
          </Tooltip>
          <span className="truncate text-sm text-gray-700">{item.description}</span>
        </div>
        <span className={`shrink-0 text-sm font-semibold tabular-nums ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
          {fmtAmount(item.amount)}
        </span>
      </div>
    </TooltipProvider>
  );
}
