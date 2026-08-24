"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { ReserveChart } from "@/components/charts/reserve-chart";
import { ReserveSheet } from "@/components/reserve/reserve-sheet";
import { Button } from "@/components/ui/button";
import {
  getMonthlyReserveMovement,
  getReserveBalance,
} from "@/lib/finance";
import { formatMonthShort, shiftMonth } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/money";
import { useFinance } from "@/providers/finance-provider";
import type { ReserveType } from "@/types/database";

export function ReservePage() {
  const { profile, reserveTransactions, selectedMonth } = useFinance();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReserveType>("deposit");

  const data = useMemo(() => {
    if (!profile) return null;
    const initial = Math.round(Number(profile.initial_savings) * 100);
    const balance = getReserveBalance(initial, reserveTransactions);
    const month = getMonthlyReserveMovement(reserveTransactions, selectedMonth);
    const goal = Math.round(Number(profile.monthly_savings_goal) * 100);

    const chart = Array.from({ length: 6 }, (_, i) => {
      const m = shiftMonth(selectedMonth, -(5 - i));
      const end = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-31`;
      const upTo = reserveTransactions.filter((r) => r.transaction_date <= end);
      return {
        label: formatMonthShort(m),
        value: getReserveBalance(initial, upTo),
      };
    });

    return { balance, month, goal, chart };
  }, [profile, reserveTransactions, selectedMonth]);

  if (!profile || !data) return null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-28 lg:pb-10">
      <AppHeader title="Minha reserva" subtitle="Seu dinheiro guardado com histórico." />

      <section className="gradient-balance rounded-[28px] p-6 text-white shadow-soft">
        <p className="text-sm text-white/70">Saldo da reserva</p>
        <p className="mt-1 text-4xl font-semibold text-balance-num">
          {formatCurrency(data.balance)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/65">Guardado este mês</p>
            <p className="mt-1 font-semibold text-balance-num">
              {formatCurrency(data.month.deposited)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/65">Meta mensal</p>
            <p className="mt-1 font-semibold text-balance-num">
              {formatCurrency(data.goal)}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            variant="soft"
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => {
              setType("deposit");
              setOpen(true);
            }}
          >
            Guardar dinheiro
          </Button>
          <Button
            variant="secondary"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            onClick={() => {
              setType("withdrawal");
              setOpen(true);
            }}
          >
            Retirar
          </Button>
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="mb-4 text-base font-semibold">Evolução</h2>
        <ReserveChart data={data.chart} />
      </section>

      <section className="card-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Histórico recente</h2>
          <Link href="/transactions" className="text-sm text-primary-medium">
            Ver tudo
          </Link>
        </div>
        <div className="space-y-3">
          {reserveTransactions.slice(0, 8).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">
                  {r.type === "deposit" ? "Depósito" : "Retirada"}
                </p>
                <p className="text-xs text-text-secondary">
                  {r.transaction_date.split("-").reverse().join("/")}
                  {r.notes ? ` · ${r.notes}` : ""}
                </p>
              </div>
              <p
                className={
                  r.type === "deposit"
                    ? "font-semibold text-success text-balance-num"
                    : "font-semibold text-text-primary text-balance-num"
                }
              >
                {r.type === "deposit" ? "+" : "-"}
                {formatCurrency(Math.round(Number(r.amount) * 100))}
              </p>
            </div>
          ))}
          {reserveTransactions.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhum movimento na reserva ainda.
            </p>
          ) : null}
        </div>
      </section>

      <ReserveSheet
        open={open}
        onClose={() => setOpen(false)}
        defaultType={type}
      />
    </div>
  );
}
