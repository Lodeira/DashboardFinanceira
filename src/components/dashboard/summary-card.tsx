import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/money";
import type { ReactNode } from "react";

interface SummaryCardProps {
  label: string;
  valueCents: number;
  icon?: ReactNode;
  tone?: "default" | "success" | "danger" | "accent";
  className?: string;
}

export function SummaryCard({
  label,
  valueCents,
  icon,
  tone = "default",
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "card-surface flex flex-col gap-3 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        {icon ? (
          <span
            className={cn("flex h-9 w-9 items-center justify-center rounded-xl", {
              "bg-muted text-primary-medium": tone === "default",
              "bg-success-soft text-success": tone === "success",
              "bg-danger-soft text-danger": tone === "danger",
              "bg-accent-light/50 text-primary-medium": tone === "accent",
            })}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="text-xl font-semibold text-balance-num text-text-primary">
        {formatCurrency(valueCents)}
      </p>
    </div>
  );
}
