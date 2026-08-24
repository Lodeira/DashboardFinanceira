import {
  addMonths,
  endOfMonth,
  format,
  getDate,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Sao_Paulo";

export function nowInSaoPaulo(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatMonthYear(date: Date): string {
  const label = format(date, "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMonthShort(date: Date): string {
  return format(date, "MMM", { locale: ptBR }).toUpperCase().replace(".", "");
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMonthRange(date: Date): { start: string; end: string } {
  return {
    start: toISODate(startOfMonth(date)),
    end: toISODate(endOfMonth(date)),
  };
}

export function shiftMonth(date: Date, delta: number): Date {
  return delta >= 0 ? addMonths(date, delta) : subMonths(date, Math.abs(delta));
}

export function getGreeting(date = nowInSaoPaulo()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function daysElapsedInMonth(date = nowInSaoPaulo()): number {
  return getDate(date);
}

export function daysInMonth(date: Date): number {
  return endOfMonth(date).getDate();
}

export function parseISODate(value: string): Date {
  return parseISO(value);
}
