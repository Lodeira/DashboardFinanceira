export type TransactionType = "income" | "expense" | "reserve";
export type NecessityType = "essential" | "non_essential" | null;
export type GoalType = "fixed" | "percent";
export type CategoryType = "expense" | "income" | "both";
export type ReserveType = "deposit" | "withdrawal";
export type Recurrence = "monthly" | "weekly" | "yearly";

export interface Profile {
  id: string;
  name: string;
  monthly_salary: number;
  payday: number;
  initial_savings: number;
  monthly_savings_goal: number;
  goal_type: GoalType;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  category_type: CategoryType;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category_id: string | null;
  necessity_type: NecessityType;
  transaction_date: string;
  notes: string | null;
  is_recurring: boolean;
  recurring_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id: string | null;
  necessity_type: NecessityType;
  billing_day: number;
  recurrence: Recurrence;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReserveTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: ReserveType;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface SalaryHistory {
  id: string;
  user_id: string;
  amount: number;
  effective_month: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null;
}
