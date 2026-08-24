import { formatCurrency } from "@/lib/utils/money";

interface SpendableCardProps {
  amountCents: number;
}

export function SpendableCard({ amountCents }: SpendableCardProps) {
  return (
    <section className="card-surface p-5 animate-fade-up">
      <p className="text-sm font-medium text-text-secondary">
        Quanto ainda posso gastar?
      </p>
      <p className="mt-1 text-sm text-text-secondary">Você ainda pode gastar</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-primary text-balance-num">
        {formatCurrency(amountCents)}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        sem comprometer sua meta deste mês.
      </p>
    </section>
  );
}
