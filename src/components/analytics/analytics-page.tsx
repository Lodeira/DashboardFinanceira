"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { CategoryChip } from "@/components/ui/category-chip";
import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { SavingsChart } from "@/components/charts/savings-chart";
import { ReserveChart } from "@/components/charts/reserve-chart";
import { EssentialSplitChart } from "@/components/charts/essential-split-chart";
import { InsightCard } from "@/components/dashboard/insight-card";
import {
  buildInsights,
  getCategoryExpenses,
  getEssentialExpenses,
  getMonthlyExpenses,
  getMonthlyIncome,
  getMonthlySavings,
  getNonEssentialExpenses,
  getReserveBalance,
  resolveMonthlySalary,
} from "@/lib/finance";
import { formatMonthShort, shiftMonth } from "@/lib/utils/date";
import { useFinance } from "@/providers/finance-provider";
import { formatCurrency } from "@/lib/utils/money";

type RangeKey = "1" | "3" | "6" | "12";

export function AnalyticsPage() {
  const {
    profile,
    transactions,
    categories,
    reserveTransactions,
    salaryHistory,
    selectedMonth,
  } = useFinance();
  const [range, setRange] = useState<RangeKey>("6");

  const monthsCount = Number(range);

  const series = useMemo(() => {
    if (!profile) return null;

    const months = Array.from({ length: monthsCount }, (_, i) =>
      shiftMonth(selectedMonth, -(monthsCount - 1 - i))
    );

    const incomeExpense = months.map((month) => {
      const salary = resolveMonthlySalary(
        Number(profile.monthly_salary),
        salaryHistory,
        month
      );
      return {
        label: formatMonthShort(month),
        income: getMonthlyIncome(transactions, salary, month),
        expense: getMonthlyExpenses(transactions, month),
      };
    });

    const savings = months.map((month) => {
      const salary = resolveMonthlySalary(
        Number(profile.monthly_salary),
        salaryHistory,
        month
      );
      return {
        label: formatMonthShort(month),
        value: getMonthlySavings(transactions, salary, month),
      };
    });

    const reserveSeries = months.map((month) => {
      const monthEnd = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-31`;
      const upTo = reserveTransactions.filter(
        (r) => r.transaction_date <= monthEnd
      );
      return {
        label: formatMonthShort(month),
        value: getReserveBalance(
          Math.round(Number(profile.initial_savings) * 100),
          upTo
        ),
      };
    });

    const salary = resolveMonthlySalary(
      Number(profile.monthly_salary),
      salaryHistory,
      selectedMonth
    );
    const expenses = getMonthlyExpenses(transactions, selectedMonth);
    const categoryMap = getCategoryExpenses(transactions, selectedMonth);
    const categoryData = Object.entries(categoryMap)
      .map(([id, value]) => ({
        name: categories.find((c) => c.id === id)?.name ?? "Outros",
        value,
      }))
      .sort((a, b) => b.value - a.value);

    const essential = getEssentialExpenses(transactions, selectedMonth);
    const nonEssential = getNonEssentialExpenses(transactions, selectedMonth);
    const insights = buildInsights({
      transactions,
      salaryCents: salary,
      month: selectedMonth,
      savingsGoalCents: Math.round(Number(profile.monthly_savings_goal) * 100),
      categories,
    });

    return {
      incomeExpense,
      savings,
      reserveSeries,
      expenses,
      categoryData,
      essential,
      nonEssential,
      insights,
    };
  }, [
    profile,
    transactions,
    categories,
    reserveTransactions,
    salaryHistory,
    selectedMonth,
    monthsCount,
  ]);

  if (!profile || !series) return null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-28 lg:pb-10">
      <AppHeader title="Análises" subtitle="Entenda seus padrões financeiros." />

      <div className="flex gap-2 overflow-x-auto">
        {(
          [
            ["1", "Este mês"],
            ["3", "3 meses"],
            ["6", "6 meses"],
            ["12", "1 ano"],
          ] as const
        ).map(([key, label]) => (
          <CategoryChip
            key={key}
            label={label}
            selected={range === key}
            onClick={() => setRange(key)}
          />
        ))}
      </div>

      <section className="card-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Receita × Despesa
        </h2>
        <IncomeExpenseChart data={series.incomeExpense} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            Gastos por categoria
          </h2>
          <CategoryDonutChart
            totalCents={series.expenses}
            data={series.categoryData}
          />
          <div className="mt-2 space-y-2">
            {series.categoryData.slice(0, 6).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-medium text-balance-num">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Essencial × Não essencial
          </h2>
          <EssentialSplitChart
            essentialCents={series.essential}
            nonEssentialCents={series.nonEssential}
          />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Evolução da economia
          </h2>
          <SavingsChart data={series.savings} />
        </section>
        <section className="card-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Evolução da reserva
          </h2>
          <ReserveChart data={series.reserveSeries} />
        </section>
      </div>

      {series.insights.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            Seus números
          </h2>
          <div className="space-y-2">
            {series.insights.map((text) => (
              <InsightCard key={text} text={text} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
