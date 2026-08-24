"use client";

import { cn } from "@/lib/utils/cn";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/money";

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (reais: number) => void;
  error?: string;
  autoFocus?: boolean;
  large?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  autoFocus,
  large,
}: CurrencyInputProps) {
  const cents = Math.round(value * 100);

  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label ? (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      ) : null}
      <input
        inputMode="numeric"
        autoFocus={autoFocus}
        value={formatCurrencyInput(cents)}
        onChange={(e) => {
          const nextCents = parseCurrencyInput(e.target.value);
          onChange(nextCents / 100);
        }}
        className={cn(
          "w-full rounded-2xl border border-border bg-white px-4 text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 text-balance-num",
          large
            ? "h-16 text-3xl font-semibold text-center tracking-tight"
            : "h-12 text-base font-medium",
          error && "border-danger"
        )}
        aria-label={label ?? "Valor em reais"}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
