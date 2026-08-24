import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

interface BalanceCardProps {
  balanceCents: number;
  incomeCents: number;
  expensesCents: number;
  savingsCents: number;
  comparisonPercent?: number | null;
  hasComparison?: boolean;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onSaveMoney?: () => void;
}

export function BalanceCard({
  balanceCents,
  incomeCents,
  expensesCents,
  savingsCents,
  comparisonPercent,
  hasComparison,
  onAddExpense,
  onAddIncome,
  onSaveMoney,
}: BalanceCardProps) {
  return (
    <section className="gradient-balance relative overflow-hidden rounded-[28px] p-5 text-white shadow-soft animate-fade-up">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <p className="text-sm text-white/75">Saldo disponível</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight text-balance-num">
        {formatCurrency(balanceCents)}
      </p>

      {hasComparison && comparisonPercent != null ? (
        <p
          className={cn(
            "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium",
            comparisonPercent >= 0
              ? "bg-success/20 text-emerald-100"
              : "bg-white/10 text-white/80"
          )}
        >
          {comparisonPercent >= 0 ? "+" : ""}
          {comparisonPercent.toFixed(1)}% em relação ao mês passado
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-[11px] text-white/65">Receita</p>
          <p className="mt-0.5 text-sm font-semibold text-balance-num">
            {formatCurrency(incomeCents)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-[11px] text-white/65">Gastos</p>
          <p className="mt-0.5 text-sm font-semibold text-balance-num">
            {formatCurrency(expensesCents)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-[11px] text-white/65">Economizado</p>
          <p className="mt-0.5 text-sm font-semibold text-balance-num">
            {formatCurrency(Math.max(0, savingsCents))}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <ShortcutButton
          label="Adicionar gasto"
          icon={<ArrowUpRight className="h-5 w-5" />}
          onClick={onAddExpense}
        />
        <ShortcutButton
          label="Adicionar receita"
          icon={<ArrowDownLeft className="h-5 w-5" />}
          onClick={onAddIncome}
        />
        <ShortcutButton
          label="Guardar dinheiro"
          icon={<PiggyBank className="h-5 w-5" />}
          onClick={onSaveMoney}
        />
      </div>
    </section>
  );
}

function ShortcutButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center transition hover:bg-white/15 active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </span>
      <span className="text-[11px] leading-tight text-white/85">{label}</span>
    </button>
  );
}
