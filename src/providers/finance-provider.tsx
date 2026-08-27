"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  mockBudgets,
  mockCategories,
  mockGoals,
  mockProfile,
  mockRecurring,
  mockReserveTransactions,
  mockTransactions,
  DEMO_USER_ID,
} from "@/lib/mocks/demo-data";
import { createClient, fetchPublicConfig } from "@/lib/supabase/client";
import { nowInSaoPaulo, shiftMonth, toISODate } from "@/lib/utils/date";
import type {
  Category,
  CategoryBudget,
  Goal,
  Profile,
  RecurringTransaction,
  ReserveTransaction,
  SalaryHistory,
  Transaction,
} from "@/types/database";
import type { GoalInput, OnboardingInput, ReserveInput, TransactionInput } from "@/schemas";

interface FinanceContextValue {
  demoMode: boolean;
  loading: boolean;
  authenticated: boolean;
  profile: Profile | null;
  categories: Category[];
  transactions: Transaction[];
  recurring: RecurringTransaction[];
  goals: Goal[];
  budgets: CategoryBudget[];
  reserveTransactions: ReserveTransaction[];
  salaryHistory: SalaryHistory[];
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  shiftSelectedMonth: (delta: number) => void;
  refresh: () => Promise<void>;
  completeOnboarding: (data: OnboardingInput) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addReserveMovement: (data: ReserveInput) => Promise<void>;
  addGoal: (data: GoalInput) => Promise<void>;
  updateGoal: (id: string, data: Partial<GoalInput>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInDemo: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function enrichTransactions(
  transactions: Transaction[],
  categories: Category[]
): Transaction[] {
  const map = Object.fromEntries(categories.map((c) => [c.id, c]));
  return transactions.map((t) => ({
    ...t,
    category: t.category_id ? map[t.category_id] ?? null : null,
  }));
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [reserveTransactions, setReserveTransactions] = useState<
    ReserveTransaction[]
  >([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => nowInSaoPaulo());

  const loadFromSupabase = useCallback(async () => {
    const config = await fetchPublicConfig();
    if (!config.configured) return;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthenticated(false);
      setProfile(null);
      setLoading(false);
      return;
    }

    setAuthenticated(true);

    const [
      profileRes,
      categoriesRes,
      transactionsRes,
      recurringRes,
      goalsRes,
      budgetsRes,
      reserveRes,
      salaryRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
      supabase.from("recurring_transactions").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id).eq("active", true),
      supabase.from("category_budgets").select("*").eq("user_id", user.id),
      supabase
        .from("reserve_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("salary_history")
        .select("*")
        .eq("user_id", user.id)
        .order("effective_month", { ascending: false }),
    ]);

    const cats = (categoriesRes.data as Category[]) ?? [];
    setProfile((profileRes.data as Profile) ?? null);
    setCategories(cats);
    setTransactions(
      enrichTransactions((transactionsRes.data as Transaction[]) ?? [], cats)
    );
    setRecurring((recurringRes.data as RecurringTransaction[]) ?? []);
    setGoals((goalsRes.data as Goal[]) ?? []);
    setBudgets((budgetsRes.data as CategoryBudget[]) ?? []);
    setReserveTransactions((reserveRes.data as ReserveTransaction[]) ?? []);
    setSalaryHistory((salaryRes.data as SalaryHistory[]) ?? []);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (demoMode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await loadFromSupabase();
  }, [demoMode, loadFromSupabase]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const config = await fetchPublicConfig();
      const isDemo = !config.configured;
      setDemoMode(isDemo);

      if (isDemo) {
        setLoading(false);
        return;
      }

      await loadFromSupabase();

      try {
        const supabase = await createClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
          void loadFromSupabase();
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, [loadFromSupabase]);

  const completeOnboarding = useCallback(
    async (data: OnboardingInput) => {
      const goalValue =
        data.goalType === "percent"
          ? (data.monthlySalary * data.monthlySavingsGoal) / 100
          : data.monthlySavingsGoal;

      if (demoMode) {
        setProfile({
          ...mockProfile,
          name: data.name,
          monthly_salary: data.monthlySalary,
          payday: data.payday,
          initial_savings: data.initialSavings,
          monthly_savings_goal: goalValue,
          goal_type: data.goalType,
          onboarding_completed: true,
        });
        toast.success("Perfil configurado.");
        return;
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          monthly_salary: data.monthlySalary,
          payday: data.payday,
          initial_savings: data.initialSavings,
          monthly_savings_goal: goalValue,
          goal_type: data.goalType,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) {
        console.error(error);
        throw new Error("Não foi possível salvar o onboarding.");
      }

      const monthStart = toISODate(
        new Date(nowInSaoPaulo().getFullYear(), nowInSaoPaulo().getMonth(), 1)
      );

      await supabase.from("salary_history").upsert({
        user_id: user.id,
        amount: data.monthlySalary,
        effective_month: monthStart,
      });

      await supabase.rpc("seed_default_categories", { p_user_id: user.id });
      toast.success("Perfil configurado.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase]
  );

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!profile) return;

      if (demoMode) {
        setProfile({ ...profile, ...data, updated_at: new Date().toISOString() });
        toast.success("Configurações atualizadas.");
        return;
      }

      const supabase = await createClient();
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profile.id);

      if (error) {
        console.error(error);
        throw new Error("Não foi possível atualizar o perfil.");
      }

      if (data.monthly_salary != null) {
        const monthStart = toISODate(
          new Date(nowInSaoPaulo().getFullYear(), nowInSaoPaulo().getMonth(), 1)
        );
        await supabase.from("salary_history").upsert({
          user_id: profile.id,
          amount: data.monthly_salary,
          effective_month: monthStart,
        });
      }

      toast.success("Configurações atualizadas.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase, profile]
  );

  const addTransaction = useCallback(
    async (data: TransactionInput) => {
      if (demoMode) {
        const newTx: Transaction = {
          id: crypto.randomUUID(),
          user_id: DEMO_USER_ID,
          description: data.description,
          amount: data.amount,
          transaction_type: data.transactionType,
          category_id: data.categoryId ?? null,
          necessity_type: data.necessityType ?? null,
          transaction_date: data.transactionDate,
          notes: data.notes ?? null,
          is_recurring: data.isRecurring ?? false,
          recurring_transaction_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: categories.find((c) => c.id === data.categoryId) ?? null,
        };
        setTransactions((prev) => [newTx, ...prev]);
        toast.success(
          data.transactionType === "income"
            ? "Receita adicionada."
            : "Gasto adicionado."
        );
        return;
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        transaction_type: data.transactionType,
        category_id: data.categoryId ?? null,
        necessity_type: data.necessityType ?? null,
        transaction_date: data.transactionDate,
        notes: data.notes || null,
        is_recurring: data.isRecurring ?? false,
      });

      if (error) {
        console.error(error);
        throw new Error("Não foi possível salvar esta movimentação. Tente novamente.");
      }

      toast.success(
        data.transactionType === "income"
          ? "Receita adicionada."
          : "Gasto adicionado."
      );
      await loadFromSupabase();
    },
    [categories, demoMode, loadFromSupabase]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<TransactionInput>) => {
      if (demoMode) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  description: data.description ?? t.description,
                  amount: data.amount ?? t.amount,
                  category_id: data.categoryId !== undefined ? data.categoryId ?? null : t.category_id,
                  necessity_type:
                    data.necessityType !== undefined
                      ? data.necessityType ?? null
                      : t.necessity_type,
                  transaction_date: data.transactionDate ?? t.transaction_date,
                  notes: data.notes !== undefined ? data.notes ?? null : t.notes,
                  transaction_type: data.transactionType ?? t.transaction_type,
                  category:
                    data.categoryId !== undefined
                      ? categories.find((c) => c.id === data.categoryId) ?? null
                      : t.category,
                  updated_at: new Date().toISOString(),
                }
              : t
          )
        );
        toast.success("Movimentação atualizada.");
        return;
      }

      const supabase = await createClient();
      const payload: Record<string, unknown> = {};
      if (data.description != null) payload.description = data.description;
      if (data.amount != null) payload.amount = data.amount;
      if (data.categoryId !== undefined) payload.category_id = data.categoryId;
      if (data.necessityType !== undefined) payload.necessity_type = data.necessityType;
      if (data.transactionDate != null) payload.transaction_date = data.transactionDate;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.transactionType != null) payload.transaction_type = data.transactionType;

      const { error } = await supabase.from("transactions").update(payload).eq("id", id);
      if (error) {
        console.error(error);
        throw new Error("Não foi possível atualizar a movimentação.");
      }
      toast.success("Movimentação atualizada.");
      await loadFromSupabase();
    },
    [categories, demoMode, loadFromSupabase]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (demoMode) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        toast.success("Movimentação excluída.");
        return;
      }

      const supabase = await createClient();
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        console.error(error);
        throw new Error("Não foi possível excluir a movimentação.");
      }
      toast.success("Movimentação excluída.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase]
  );

  const addReserveMovement = useCallback(
    async (data: ReserveInput) => {
      if (demoMode) {
        const entry: ReserveTransaction = {
          id: crypto.randomUUID(),
          user_id: DEMO_USER_ID,
          amount: data.amount,
          type: data.type,
          transaction_date: data.transactionDate,
          notes: data.notes ?? null,
          created_at: new Date().toISOString(),
        };
        setReserveTransactions((prev) => [entry, ...prev]);

        await addTransaction({
          amount: data.amount,
          description:
            data.type === "deposit"
              ? "Transferência para reserva"
              : "Retirada da reserva",
          transactionType: "reserve",
          transactionDate: data.transactionDate,
          notes: data.notes,
          necessityType: null,
          categoryId: null,
        });

        toast.success(
          data.type === "deposit" ? "Dinheiro guardado." : "Retirada registrada."
        );
        return;
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("reserve_transactions").insert({
        user_id: user.id,
        amount: data.amount,
        type: data.type,
        transaction_date: data.transactionDate,
        notes: data.notes || null,
      });

      if (error) {
        console.error(error);
        throw new Error("Não foi possível registrar a movimentação da reserva.");
      }

      await supabase.from("transactions").insert({
        user_id: user.id,
        description:
          data.type === "deposit"
            ? "Transferência para reserva"
            : "Retirada da reserva",
        amount: data.amount,
        transaction_type: "reserve",
        transaction_date: data.transactionDate,
        notes: data.notes || null,
        necessity_type: null,
      });

      toast.success(
        data.type === "deposit" ? "Dinheiro guardado." : "Retirada registrada."
      );
      await loadFromSupabase();
    },
    [addTransaction, demoMode, loadFromSupabase]
  );

  const addGoal = useCallback(
    async (data: GoalInput) => {
      if (demoMode) {
        setGoals((prev) => [
          {
            id: crypto.randomUUID(),
            user_id: DEMO_USER_ID,
            name: data.name,
            target_amount: data.targetAmount,
            current_amount: data.currentAmount ?? 0,
            target_date: data.targetDate ?? null,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast.success("Meta criada.");
        return;
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        name: data.name,
        target_amount: data.targetAmount,
        current_amount: data.currentAmount ?? 0,
        target_date: data.targetDate || null,
      });

      if (error) {
        console.error(error);
        throw new Error("Não foi possível criar a meta.");
      }
      toast.success("Meta criada.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase]
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<GoalInput>) => {
      if (demoMode) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === id
              ? {
                  ...g,
                  name: data.name ?? g.name,
                  target_amount: data.targetAmount ?? g.target_amount,
                  current_amount: data.currentAmount ?? g.current_amount,
                  target_date:
                    data.targetDate !== undefined ? data.targetDate ?? null : g.target_date,
                }
              : g
          )
        );
        toast.success("Meta atualizada.");
        return;
      }

      const supabase = await createClient();
      const payload: Record<string, unknown> = {};
      if (data.name != null) payload.name = data.name;
      if (data.targetAmount != null) payload.target_amount = data.targetAmount;
      if (data.currentAmount != null) payload.current_amount = data.currentAmount;
      if (data.targetDate !== undefined) payload.target_date = data.targetDate;

      const { error } = await supabase.from("goals").update(payload).eq("id", id);
      if (error) {
        console.error(error);
        throw new Error("Não foi possível atualizar a meta.");
      }
      toast.success("Meta atualizada.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (demoMode) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
        toast.success("Meta removida.");
        return;
      }

      const supabase = await createClient();
      const { error } = await supabase
        .from("goals")
        .update({ active: false })
        .eq("id", id);
      if (error) {
        console.error(error);
        throw new Error("Não foi possível remover a meta.");
      }
      toast.success("Meta removida.");
      await loadFromSupabase();
    },
    [demoMode, loadFromSupabase]
  );

  const signOut = useCallback(async () => {
    if (demoMode) {
      setAuthenticated(false);
      setProfile(null);
      return;
    }
    const supabase = await createClient();
    await supabase.auth.signOut();
    setAuthenticated(false);
    setProfile(null);
  }, [demoMode]);

  const signInDemo = useCallback(() => {
    setAuthenticated(true);
    setProfile(mockProfile);
    setCategories(mockCategories);
    setTransactions(enrichTransactions(mockTransactions, mockCategories));
    setRecurring(mockRecurring);
    setGoals(mockGoals);
    setBudgets(mockBudgets);
    setReserveTransactions(mockReserveTransactions);
  }, []);

  const shiftSelectedMonth = useCallback((delta: number) => {
    setSelectedMonth((prev) => shiftMonth(prev, delta));
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      demoMode,
      loading,
      authenticated,
      profile,
      categories,
      transactions,
      recurring,
      goals,
      budgets,
      reserveTransactions,
      salaryHistory,
      selectedMonth,
      setSelectedMonth,
      shiftSelectedMonth,
      refresh,
      completeOnboarding,
      updateProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addReserveMovement,
      addGoal,
      updateGoal,
      deleteGoal,
      signOut,
      signInDemo,
    }),
    [
      demoMode,
      loading,
      authenticated,
      profile,
      categories,
      transactions,
      recurring,
      goals,
      budgets,
      reserveTransactions,
      salaryHistory,
      selectedMonth,
      shiftSelectedMonth,
      refresh,
      completeOnboarding,
      updateProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addReserveMovement,
      addGoal,
      updateGoal,
      deleteGoal,
      signOut,
      signInDemo,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  }
  return ctx;
}
