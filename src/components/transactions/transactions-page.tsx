"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { MonthSelector } from "@/components/layout/month-selector";
import { Fab } from "@/components/layout/fab";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { CategoryChip } from "@/components/ui/category-chip";
import { Input } from "@/components/ui/input";
import { getMonthRange } from "@/lib/utils/date";
import { useFinance } from "@/providers/finance-provider";
import type { Transaction } from "@/types/database";

type FilterType =
  | "all"
  | "income"
  | "expense"
  | "essential"
  | "non_essential";

export function TransactionsPage() {
  const { transactions, categories, selectedMonth } = useFinance();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth);

    return transactions.filter((t) => {
      if (t.transaction_date < start || t.transaction_date > end) return false;
      if (t.transaction_type === "reserve") return false;

      if (filter === "income" && t.transaction_type !== "income") return false;
      if (filter === "expense" && t.transaction_type !== "expense") return false;
      if (filter === "essential" && t.necessity_type !== "essential") return false;
      if (filter === "non_essential" && t.necessity_type !== "non_essential")
        return false;

      if (categoryId && t.category_id !== categoryId) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${t.description} ${t.category?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, filter, categoryId, query]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 pb-28 lg:pb-10">
      <AppHeader title="Movimentações" subtitle="Histórico do mês selecionado." />
      <MonthSelector />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          className="pl-10"
          placeholder="Pesquisar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Pesquisar movimentações"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["all", "Todos"],
            ["expense", "Despesas"],
            ["income", "Receitas"],
            ["essential", "Essencial"],
            ["non_essential", "Não essencial"],
          ] as const
        ).map(([key, label]) => (
          <CategoryChip
            key={key}
            label={label}
            selected={filter === key}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <CategoryChip
          label="Todas categorias"
          selected={categoryId === null}
          onClick={() => setCategoryId(null)}
        />
        {categories
          .filter((c) => c.category_type !== "income")
          .map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            />
          ))}
      </div>

      <TransactionList
        transactions={filtered}
        onSelect={(tx) => {
          setEditing(tx);
          setSheetOpen(true);
        }}
        onAdd={() => {
          setEditing(null);
          setSheetOpen(true);
        }}
      />

      <Fab
        onClick={() => {
          setEditing(null);
          setSheetOpen(true);
        }}
      />

      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
    </div>
  );
}
