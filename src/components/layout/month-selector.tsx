"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "@/lib/utils/date";
import { useFinance } from "@/providers/finance-provider";

export function MonthSelector() {
  const { selectedMonth, shiftSelectedMonth } = useFinance();

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-2 py-1.5 shadow-card">
      <button
        type="button"
        onClick={() => shiftSelectedMonth(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-muted"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <p className="text-sm font-semibold text-primary">
        {formatMonthYear(selectedMonth)}
      </p>
      <button
        type="button"
        onClick={() => shiftSelectedMonth(1)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-muted"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
