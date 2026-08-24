import { formatCurrency } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

interface NonEssentialCardProps {
  amountCents: number;
  percentOfExpenses: number;
  diffCents: number | null;
  hasComparison: boolean;
}

export function NonEssentialCard({
  amountCents,
  percentOfExpenses,
  diffCents,
  hasComparison,
}: NonEssentialCardProps) {
  return (
    <section className="card-surface overflow-hidden p-5 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Besteiras do mês
          </p>
          <p className="mt-1 text-3xl font-semibold text-primary text-balance-num">
            {formatCurrency(amountCents)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {percentOfExpenses.toFixed(0)}% dos seus gastos
          </p>
        </div>
        <span className="rounded-full bg-accent-light/60 px-3 py-1 text-xs font-medium text-primary-medium">
          Não essenciais
        </span>
      </div>

      {hasComparison && diffCents != null ? (
        <p
          className={cn(
            "mt-4 rounded-2xl px-3 py-2.5 text-sm",
            diffCents <= 0
              ? "bg-success-soft text-success"
              : "bg-muted text-text-secondary"
          )}
        >
          {diffCents === 0
            ? "Mesmo valor de não essenciais que no mês passado."
            : diffCents < 0
              ? `${formatCurrency(Math.abs(diffCents))} a menos que no mês passado`
              : `${formatCurrency(diffCents)} a mais que no mês passado`}
        </p>
      ) : null}
    </section>
  );
}
