import type {
  CategoryBudget,
  Goal,
  RecurringTransaction,
  Transaction,
} from "@/types/database";
import {
  daysElapsedInMonth,
  daysInMonth,
  getMonthRange,
  isSameMonth,
  parseISODate,
  shiftMonth,
} from "@/lib/utils/date";
import {
  addCents,
  formatCurrency,
  percentOf,
  subCents,
  type MoneyCents,
} from "@/lib/utils/money";

function toCentsFromDb(amount: number): MoneyCents {
  return Math.round(Number(amount) * 100);
}

export function getMonthlyIncome(
  transactions: Transaction[],
  salaryCents: MoneyCents,
  month: Date
): MoneyCents {
  const { start, end } = getMonthRange(month);
  const extras = transactions
    .filter(
      (t) =>
        t.transaction_type === "income" &&
        t.transaction_date >= start &&
        t.transaction_date <= end
    )
    .reduce((sum, t) => sum + toCentsFromDb(t.amount), 0);

  return addCents(salaryCents, extras);
}

export function getMonthlyExpenses(
  transactions: Transaction[],
  month: Date
): MoneyCents {
  const { start, end } = getMonthRange(month);
  return transactions
    .filter(
      (t) =>
        t.transaction_type === "expense" &&
        t.transaction_date >= start &&
        t.transaction_date <= end
    )
    .reduce((sum, t) => sum + toCentsFromDb(t.amount), 0);
}

export function getMonthlyBalance(
  transactions: Transaction[],
  salaryCents: MoneyCents,
  month: Date
): MoneyCents {
  return subCents(
    getMonthlyIncome(transactions, salaryCents, month),
    getMonthlyExpenses(transactions, month)
  );
}

export function getMonthlySavings(
  transactions: Transaction[],
  salaryCents: MoneyCents,
  month: Date
): MoneyCents {
  return getMonthlyBalance(transactions, salaryCents, month);
}

export function getEssentialExpenses(
  transactions: Transaction[],
  month: Date
): MoneyCents {
  const { start, end } = getMonthRange(month);
  return transactions
    .filter(
      (t) =>
        t.transaction_type === "expense" &&
        t.necessity_type === "essential" &&
        t.transaction_date >= start &&
        t.transaction_date <= end
    )
    .reduce((sum, t) => sum + toCentsFromDb(t.amount), 0);
}

export function getNonEssentialExpenses(
  transactions: Transaction[],
  month: Date
): MoneyCents {
  const { start, end } = getMonthRange(month);
  return transactions
    .filter(
      (t) =>
        t.transaction_type === "expense" &&
        t.necessity_type === "non_essential" &&
        t.transaction_date >= start &&
        t.transaction_date <= end
    )
    .reduce((sum, t) => sum + toCentsFromDb(t.amount), 0);
}

export function getCategoryExpenses(
  transactions: Transaction[],
  month: Date
): Record<string, MoneyCents> {
  const { start, end } = getMonthRange(month);
  const map: Record<string, MoneyCents> = {};

  for (const t of transactions) {
    if (
      t.transaction_type !== "expense" ||
      t.transaction_date < start ||
      t.transaction_date > end ||
      !t.category_id
    ) {
      continue;
    }
    map[t.category_id] = addCents(map[t.category_id] ?? 0, toCentsFromDb(t.amount));
  }

  return map;
}

export function getPreviousMonthComparison(
  transactions: Transaction[],
  salaryCents: MoneyCents,
  month: Date
): {
  balanceDiff: MoneyCents;
  balancePercent: number | null;
  expenseDiff: MoneyCents;
  nonEssentialDiff: MoneyCents;
  hasPreviousData: boolean;
} {
  const previous = shiftMonth(month, -1);
  const currentBalance = getMonthlyBalance(transactions, salaryCents, month);
  const previousBalance = getMonthlyBalance(transactions, salaryCents, previous);
  const currentExpenses = getMonthlyExpenses(transactions, month);
  const previousExpenses = getMonthlyExpenses(transactions, previous);
  const currentNonEssential = getNonEssentialExpenses(transactions, month);
  const previousNonEssential = getNonEssentialExpenses(transactions, previous);

  const hasPreviousData =
    previousExpenses > 0 ||
    getMonthlyIncome(transactions, salaryCents, previous) > 0;

  const balanceDiff = subCents(currentBalance, previousBalance);
  const balancePercent =
    previousBalance === 0
      ? null
      : (balanceDiff / Math.abs(previousBalance)) * 100;

  return {
    balanceDiff,
    balancePercent,
    expenseDiff: subCents(currentExpenses, previousExpenses),
    nonEssentialDiff: subCents(currentNonEssential, previousNonEssential),
    hasPreviousData,
  };
}

export function getSavingsGoalProgress(
  savedCents: MoneyCents,
  goalCents: MoneyCents
): { current: MoneyCents; target: MoneyCents; percent: number } {
  const percent = goalCents <= 0 ? 0 : Math.min(100, (savedCents / goalCents) * 100);
  return { current: savedCents, target: goalCents, percent };
}

export function getCategoryBudgetProgress(
  spentCents: MoneyCents,
  limitCents: MoneyCents
): {
  spent: MoneyCents;
  limit: MoneyCents;
  percent: number;
  status: "ok" | "warning" | "over";
} {
  const percent = limitCents <= 0 ? 0 : (spentCents / limitCents) * 100;
  let status: "ok" | "warning" | "over" = "ok";
  if (percent >= 100) status = "over";
  else if (percent >= 80) status = "warning";
  return { spent: spentCents, limit: limitCents, percent, status };
}

export function getCommittedAmount(
  recurring: RecurringTransaction[]
): MoneyCents {
  return recurring
    .filter((r) => r.active)
    .reduce((sum, r) => sum + toCentsFromDb(r.amount), 0);
}

export function getSpendableAmount(params: {
  incomeCents: MoneyCents;
  expensesCents: MoneyCents;
  committedRemainingCents: MoneyCents;
  savingsGoalCents: MoneyCents;
}): MoneyCents {
  const remaining = subCents(
    params.incomeCents,
    addCents(
      params.expensesCents,
      params.committedRemainingCents,
      params.savingsGoalCents
    )
  );
  return Math.max(0, remaining);
}

export function getRemainingCommitted(
  recurring: RecurringTransaction[],
  transactions: Transaction[],
  month: Date
): MoneyCents {
  const { start, end } = getMonthRange(month);
  const committed = getCommittedAmount(recurring);

  const alreadyPaidFromRecurring = transactions
    .filter(
      (t) =>
        t.transaction_type === "expense" &&
        t.is_recurring &&
        t.transaction_date >= start &&
        t.transaction_date <= end
    )
    .reduce((sum, t) => sum + toCentsFromDb(t.amount), 0);

  return Math.max(0, subCents(committed, alreadyPaidFromRecurring));
}

export function getReserveBalance(
  initialSavingsCents: MoneyCents,
  reserveTransactions: { amount: number; type: "deposit" | "withdrawal" }[]
): MoneyCents {
  const movement = reserveTransactions.reduce((sum, t) => {
    const cents = toCentsFromDb(t.amount);
    return t.type === "deposit" ? sum + cents : sum - cents;
  }, 0);
  return addCents(initialSavingsCents, movement);
}

export function getMonthlyReserveMovement(
  reserveTransactions: { amount: number; type: "deposit" | "withdrawal"; transaction_date: string }[],
  month: Date
): { deposited: MoneyCents; withdrawn: MoneyCents; net: MoneyCents } {
  const { start, end } = getMonthRange(month);
  let deposited = 0;
  let withdrawn = 0;

  for (const t of reserveTransactions) {
    if (t.transaction_date < start || t.transaction_date > end) continue;
    const cents = toCentsFromDb(t.amount);
    if (t.type === "deposit") deposited += cents;
    else withdrawn += cents;
  }

  return { deposited, withdrawn, net: subCents(deposited, withdrawn) };
}

export function getDailyAverageSpending(
  transactions: Transaction[],
  month: Date,
  referenceDate = new Date()
): MoneyCents {
  const expenses = getMonthlyExpenses(transactions, month);
  const days = isSameMonth(month, referenceDate)
    ? Math.max(1, daysElapsedInMonth(referenceDate))
    : daysInMonth(month);
  return Math.round(expenses / days);
}

export function getProjectedMonthBalance(params: {
  incomeCents: MoneyCents;
  expensesCents: MoneyCents;
  month: Date;
  referenceDate?: Date;
}): MoneyCents {
  const ref = params.referenceDate ?? new Date();
  if (!isSameMonth(params.month, ref)) {
    return subCents(params.incomeCents, params.expensesCents);
  }

  const elapsed = Math.max(1, daysElapsedInMonth(ref));
  const dailyAvg = Math.round(params.expensesCents / elapsed);
  const remainingDays = daysInMonth(params.month) - elapsed;
  const projectedExpenses = addCents(
    params.expensesCents,
    dailyAvg * remainingDays
  );

  return subCents(params.incomeCents, projectedExpenses);
}

export function getTopExpenseCategory(
  transactions: Transaction[],
  month: Date
): { categoryId: string; amount: MoneyCents } | null {
  const map = getCategoryExpenses(transactions, month);
  const entries = Object.entries(map);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { categoryId: entries[0][0], amount: entries[0][1] };
}

export function getLargestExpense(
  transactions: Transaction[],
  month: Date
): Transaction | null {
  const { start, end } = getMonthRange(month);
  const expenses = transactions.filter(
    (t) =>
      t.transaction_type === "expense" &&
      t.transaction_date >= start &&
      t.transaction_date <= end
  );
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) =>
    toCentsFromDb(t.amount) > toCentsFromDb(max.amount) ? t : max
  );
}

export function buildInsights(params: {
  transactions: Transaction[];
  salaryCents: MoneyCents;
  month: Date;
  savingsGoalCents: MoneyCents;
  categories: { id: string; name: string }[];
}): string[] {
  const {
    transactions,
    salaryCents,
    month,
    savingsGoalCents,
    categories,
  } = params;

  const insights: string[] = [];
  const expenses = getMonthlyExpenses(transactions, month);
  const nonEssential = getNonEssentialExpenses(transactions, month);
  const savings = getMonthlySavings(transactions, salaryCents, month);
  const comparison = getPreviousMonthComparison(transactions, salaryCents, month);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const top = getTopExpenseCategory(transactions, month);
  const dailyAvg = getDailyAverageSpending(transactions, month);
  const projected = getProjectedMonthBalance({
    incomeCents: getMonthlyIncome(transactions, salaryCents, month),
    expensesCents: expenses,
    month,
  });

  if (expenses > 0 && nonEssential > 0) {
    const pct = percentOf(nonEssential, expenses);
    insights.push(
      `${pct.toFixed(0)}% dos seus gastos foram não essenciais (${formatCurrency(nonEssential)}).`
    );
  }

  if (savingsGoalCents > 0) {
    const progress = getSavingsGoalProgress(Math.max(0, savings), savingsGoalCents);
    insights.push(
      `Você atingiu ${progress.percent.toFixed(0)}% da sua meta de economia.`
    );
  }

  if (top && categoryMap[top.categoryId]) {
    insights.push(
      `${categoryMap[top.categoryId]} foi sua maior categoria de gastos (${formatCurrency(top.amount)}).`
    );
  }

  if (comparison.hasPreviousData && comparison.nonEssentialDiff !== 0) {
    const abs = Math.abs(comparison.nonEssentialDiff);
    if (comparison.nonEssentialDiff < 0) {
      insights.push(
        `Você gastou ${formatCurrency(abs)} a menos com não essenciais neste mês.`
      );
    } else {
      insights.push(
        `Você gastou ${formatCurrency(abs)} a mais com não essenciais neste mês.`
      );
    }
  }

  if (comparison.hasPreviousData && comparison.balanceDiff !== 0) {
    const abs = Math.abs(comparison.balanceDiff);
    if (comparison.balanceDiff > 0) {
      insights.push(
        `Você economizou ${formatCurrency(abs)} a mais que no mês anterior.`
      );
    } else {
      insights.push(
        `Você economizou ${formatCurrency(abs)} a menos que no mês anterior.`
      );
    }
  }

  if (expenses > 0) {
    insights.push(
      `Sua média diária de gastos é ${formatCurrency(dailyAvg)}.`
    );
  }

  if (isSameMonth(month, new Date()) && expenses > 0) {
    insights.push(
      `Se mantiver esse ritmo, terminará o mês com aproximadamente ${formatCurrency(Math.max(0, projected))} disponíveis.`
    );
  }

  return insights.slice(0, 6);
}

export function resolveMonthlySalary(
  currentSalary: number,
  history: { amount: number; effective_month: string }[],
  month: Date
): MoneyCents {
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
  const applicable = history
    .filter((h) => h.effective_month <= monthKey)
    .sort((a, b) => b.effective_month.localeCompare(a.effective_month));

  if (applicable.length > 0) {
    return toCentsFromDb(applicable[0].amount);
  }

  return toCentsFromDb(currentSalary);
}

export function mapBudgetProgress(
  budgets: CategoryBudget[],
  categoryExpenses: Record<string, MoneyCents>
) {
  return budgets.map((b) => {
    const spent = categoryExpenses[b.category_id] ?? 0;
    const limit = toCentsFromDb(b.monthly_limit);
    return {
      budget: b,
      ...getCategoryBudgetProgress(spent, limit),
    };
  });
}

export function mapGoalProgress(goals: Goal[]) {
  return goals.map((g) => ({
    goal: g,
    ...getSavingsGoalProgress(
      toCentsFromDb(g.current_amount),
      toCentsFromDb(g.target_amount)
    ),
  }));
}
