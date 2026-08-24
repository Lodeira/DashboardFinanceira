import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";

interface GoalCardProps {
  name: string;
  currentCents: number;
  targetCents: number;
  percent: number;
  onEdit?: () => void;
}

export function GoalCard({
  name,
  currentCents,
  targetCents,
  percent,
  onEdit,
}: GoalCardProps) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-text-primary">{name}</p>
          <p className="mt-1 text-sm text-text-secondary text-balance-num">
            {formatCurrency(currentCents)} / {formatCurrency(targetCents)}
          </p>
        </div>
        <span className="rounded-full bg-accent-light/60 px-2.5 py-1 text-xs font-semibold text-primary">
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-accent to-primary-medium transition-all duration-500"
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {onEdit ? (
        <Button variant="ghost" size="sm" className="mt-3 px-0" onClick={onEdit}>
          Atualizar
        </Button>
      ) : null}
    </div>
  );
}
