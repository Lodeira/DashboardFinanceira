"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Avatar } from "@/components/layout/avatar";
import { MonthSelector } from "@/components/layout/month-selector";
import { Fab } from "@/components/layout/fab";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SpendableCard } from "@/components/dashboard/spendable-card";
import { NonEssentialCard } from "@/components/dashboard/non-essential-card";
import { CommittedCard } from "@/components/dashboard/committed-card";
import { InsightCard } from "@/components/dashboard/insight-card";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { ReserveSheet } from "@/components/reserve/reserve-sheet";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import {
  buildInsights,
  getCategoryExpenses,
  getCommittedAmount,
  getEssentialExpenses,
  getMonthlyBalance,
  getMonthlyExpenses,
  getMonthlyIncome,
  getMonthlyReserveMovement,
  getMonthlySavings,
  getNonEssentialExpenses,
  getPreviousMonthComparison,
  getRemainingCommitted,
  getReserveBalance,
  getSpendableAmount,
  mapBudgetProgress,
  resolveMonthlySalary,
} from "@/lib/finance";
import { getGreeting } from "@/lib/utils/date";
import { percentOf } from "@/lib/utils/money";
import { useFinance } from "@/providers/finance-provider";
import type { TransactionType } from "@/types/database";

export function DashboardPage() {
  const {
    loading,
    profile,
    transactions,
    categories,
    recurring,
    budgets,
    reserveTransactions,
    salaryHistory,
    selectedMonth,
  } = useFinance();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<TransactionType>("expense");
  const [reserveOpen, setReserveOpen] = useState(false);

  const data = useMemo(() => {
    if (!profile) return null;

    const salaryCents = resolveMonthlySalary(
      Number(profile.monthly_salary),
      salaryHistory,
      selectedMonth
    );
    const income = getMonthlyIncome(transactions, salaryCents, selectedMonth);
    const expenses = getMonthlyExpenses(transactions, selectedMonth);
    const balance = getMonthlyBalance(transactions, salaryCents, selectedMonth);
    const savings = getMonthlySavings(transactions, salaryCents, selectedMonth);
    const nonEssential = getNonEssentialExpenses(transactions, selectedMonth);
    const essential = getEssentialExpenses(transactions, selectedMonth);
    const comparison = getPreviousMonthComparison(
      transactions,
      salaryCents,
      selectedMonth
    );
    const committed = getCommittedAmount(recurring);
    const remainingCommitted = getRemainingCommitted(
      recurring,
      transactions,
      selectedMonth
    );
    const goalCents = Math.round(Number(profile.monthly_savings_goal) * 100);
    const spendable = getSpendableAmount({
      incomeCents: income,
      expensesCents: expenses,
      committedRemainingCents: remainingCommitted,
      savingsGoalCents: goalCents,
    });
    const reserveBalance = getReserveBalance(
      Math.round(Number(profile.initial_savings) * 100),
      reserveTransactions
    );
    const reserveMonth = getMonthlyReserveMovement(
      reserveTransactions,
      selectedMonth
    );
    const categoryExpenses = getCategoryExpenses(transactions, selectedMonth);
    const budgetRows = mapBudgetProgress(budgets, categoryExpenses).map((row) => ({
      ...row,
      name:
        categories.find((c) => c.id === row.budget.category_id)?.name ?? "Categoria",
    }));
    const insights = buildInsights({
      transactions,
      salaryCents,
      month: selectedMonth,
      savingsGoalCents: goalCents,
      categories,
    });

    return {
      income,
      expenses,
      balance,
      savings,
      nonEssential,
      essential,
      comparison,
      committed,
      spendable,
      reserveBalance,
      reserveMonth,
      budgetRows,
      insights,
      nonEssentialPct: percentOf(nonEssential, expenses || 1),
    };
  }, [
    profile,
    transactions,
    categories,
    recurring,
    budgets,
    reserveTransactions,
    salaryHistory,
    selectedMonth,
  ]);

  if (loading || !profile || !data) {
    return <DashboardSkeleton />;
  }

  const firstName = profile.name.split(" ")[0];

  function openSheet(type: TransactionType) {
    setSheetType(type);
    setSheetOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-28 lg:pb-10">
      <AppHeader
        showBrand
        title={`${getGreeting()}, ${firstName}`}
        subtitle="Veja como estão suas finanças."
        rightSlot={<Avatar name={profile.name} />}
      />

      <MonthSelector />

      <BalanceCard
        balanceCents={data.balance}
        incomeCents={data.income}
        expensesCents={data.expenses}
        savingsCents={data.savings}
        comparisonPercent={data.comparison.balancePercent}
        hasComparison={data.comparison.hasPreviousData}
        onAddExpense={() => openSheet("expense")}
        onAddIncome={() => openSheet("income")}
        onSaveMoney={() => setReserveOpen(true)}
      />

      <section>
        <h2 className="mb-3 text-base font-semibold text-text-primary">
          Resumo do mês
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Receita"
            valueCents={data.income}
            icon={<ArrowDownCircle className="h-4 w-4" />}
            tone="success"
          />
          <SummaryCard
            label="Gastos"
            valueCents={data.expenses}
            icon={<ArrowUpCircle className="h-4 w-4" />}
            tone="accent"
          />
          <SummaryCard
            label="Economia"
            valueCents={Math.max(0, data.savings)}
            icon={<Wallet className="h-4 w-4" />}
            tone="success"
          />
          <SummaryCard
            label="Guardado"
            valueCents={data.reserveMonth.deposited}
            icon={<PiggyBank className="h-4 w-4" />}
            tone="default"
          />
        </div>
      </section>

      <SpendableCard amountCents={data.spendable} />

      <NonEssentialCard
        amountCents={data.nonEssential}
        percentOfExpenses={data.expenses > 0 ? data.nonEssentialPct : 0}
        diffCents={data.comparison.nonEssentialDiff}
        hasComparison={data.comparison.hasPreviousData}
      />

      <CommittedCard
        committedCents={data.committed}
        incomeCents={data.income}
      />

      {data.budgetRows.length > 0 ? (
        <section className="card-surface space-y-4 p-5">
          <h2 className="text-base font-semibold text-text-primary">
            Orçamento por categoria
          </h2>
          {data.budgetRows.map((row) => (
            <BudgetProgress
              key={row.budget.id}
              name={row.name}
              spentCents={row.spent}
              limitCents={row.limit}
              percent={row.percent}
              status={row.status}
            />
          ))}
        </section>
      ) : null}

      {data.insights.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            Seus números
          </h2>
          <div className="space-y-2">
            {data.insights.map((text) => (
              <InsightCard key={text} text={text} />
            ))}
          </div>
        </section>
      ) : null}

      <Fab onClick={() => openSheet("expense")} label="Adicionar gasto" />

      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultType={sheetType}
      />
      <ReserveSheet open={reserveOpen} onClose={() => setReserveOpen(false)} />
    </div>
  );
}
