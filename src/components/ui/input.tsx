import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label ? (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      ) : null}
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-2xl border border-border bg-white px-4 text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
