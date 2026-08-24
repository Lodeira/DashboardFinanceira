import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/money";

interface BudgetProgressProps {
  name: string;
  spentCents: number;
  limitCents: number;
  percent: number;
  status: "ok" | "warning" | "over";
}

export function BudgetProgress({
  name,
  spentCents,
  limitCents,
  percent,
  status,
}: BudgetProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-primary">{name}</p>
        <p className="text-sm text-text-secondary text-balance-num">
          {formatCurrency(spentCents)} / {formatCurrency(limitCents)}
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-accent": status === "ok",
            "bg-warning": status === "warning",
            "bg-danger": status === "over",
          })}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p
        className={cn("text-xs", {
          "text-text-secondary": status === "ok",
          "text-warning": status === "warning",
          "text-danger": status === "over",
        })}
      >
        {percent.toFixed(0)}%
        {status === "warning" ? " · atenção" : null}
        {status === "over" ? " · acima do limite" : null}
      </p>
    </div>
  );
}
