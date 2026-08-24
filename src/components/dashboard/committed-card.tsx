import { formatCurrency, percentOf } from "@/lib/utils/money";

interface CommittedCardProps {
  committedCents: number;
  incomeCents: number;
}

export function CommittedCard({ committedCents, incomeCents }: CommittedCardProps) {
  const pct = percentOf(committedCents, incomeCents);

  return (
    <section className="card-surface p-5 animate-fade-up">
      <p className="text-sm font-medium text-text-secondary">Compromissos mensais</p>
      <p className="mt-1 text-2xl font-semibold text-primary text-balance-num">
        {formatCurrency(committedCents)}
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        comprometidos todo mês
        {incomeCents > 0 ? ` · ${pct.toFixed(0)}% da sua renda mensal` : ""}
      </p>
    </section>
  );
}
