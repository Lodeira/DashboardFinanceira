import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface CategoryChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  label: string;
}

export function CategoryChip({
  selected,
  label,
  className,
  ...props
}: CategoryChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition border",
        selected
          ? "bg-primary text-white border-primary"
          : "bg-white text-text-secondary border-border hover:border-accent",
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}
