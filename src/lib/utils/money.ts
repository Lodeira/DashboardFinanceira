/** Valores monetários são tratados em centavos (inteiros) para evitar erro de float. */

export type MoneyCents = number;

export function toCents(value: number | string): MoneyCents {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }

  const cleaned = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  if (!cleaned || cleaned === "-") return 0;

  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function fromCents(cents: MoneyCents): number {
  return cents / 100;
}

export function addCents(...values: MoneyCents[]): MoneyCents {
  return values.reduce((acc, v) => acc + v, 0);
}

export function subCents(a: MoneyCents, b: MoneyCents): MoneyCents {
  return a - b;
}

export function mulCents(cents: MoneyCents, factor: number): MoneyCents {
  return Math.round(cents * factor);
}

export function percentOf(part: MoneyCents, total: MoneyCents): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

export function formatCurrency(cents: MoneyCents): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(fromCents(cents));
}

export function formatCurrencyCompact(cents: MoneyCents): string {
  const value = fromCents(cents);
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return formatCurrency(cents);
}

export function parseCurrencyInput(raw: string): MoneyCents {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function formatCurrencyInput(cents: MoneyCents): string {
  return formatCurrency(cents);
}
