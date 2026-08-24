"use client";

import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/money";
import type { Transaction } from "@/types/database";

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isIncome = transaction.transaction_type === "income";
  const isReserve = transaction.transaction_type === "reserve";
  const sign = isIncome ? "+" : "-";
  const amountCents = Math.round(Number(transaction.amount) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-1 py-3 text-left transition hover:bg-muted/70"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
          isIncome
            ? "bg-success-soft text-success"
            : isReserve
              ? "bg-accent-light/60 text-primary-medium"
              : "bg-muted text-primary"
        )}
      >
        {(transaction.category?.name ?? transaction.description)
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text-primary">
          {transaction.description}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {transaction.category?.name ??
            (isIncome ? "Receita" : isReserve ? "Reserva" : "Despesa")}
          {transaction.necessity_type === "non_essential"
            ? " · Não essencial"
            : transaction.necessity_type === "essential"
              ? " · Essencial"
              : ""}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold text-balance-num",
          isIncome ? "text-success" : "text-text-primary"
        )}
      >
        {sign}
        {formatCurrency(amountCents)}
      </p>
    </button>
  );
}
