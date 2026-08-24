"use client";

import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/database";
import { ReceiptText } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onSelect?: (tx: Transaction) => void;
  onAdd?: () => void;
}

function groupLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "HOJE";
  if (isYesterday(date)) return "ONTEM";
  return format(date, "dd 'de' MMMM", { locale: ptBR }).toUpperCase();
}

export function TransactionList({
  transactions,
  onSelect,
  onAdd,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="h-6 w-6" />}
        title="Nenhuma movimentação ainda."
        description="Adicione sua primeira movimentação para começar."
        action={
          onAdd ? (
            <Button onClick={onAdd}>Adicionar movimentação</Button>
          ) : undefined
        }
      />
    );
  }

  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = tx.transaction_date;
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([date, items]) => (
        <section key={date}>
          <h3 className="mb-1 px-1 text-xs font-semibold tracking-wide text-text-secondary">
            {groupLabel(date)}
          </h3>
          <div className="card-surface divide-y divide-border/60 px-3">
            {items.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={() => onSelect?.(tx)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
