import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-surface flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className
      )}
    >
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary-medium">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
