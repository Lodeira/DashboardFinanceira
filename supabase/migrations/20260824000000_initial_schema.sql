-- Gabriel Finance — schema inicial + RLS
-- Execute no SQL Editor do Supabase ou via CLI

create extension if not exists "pgcrypto";

-- Profiles (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  monthly_salary numeric(14,2) not null default 0,
  payday integer not null default 1 check (payday between 1 and 31),
  initial_savings numeric(14,2) not null default 0,
  monthly_savings_goal numeric(14,2) not null default 0,
  goal_type text not null default 'fixed' check (goal_type in ('fixed', 'percent')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Histórico de salário (evita alterar retroativamente meses antigos)
create table if not exists public.salary_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  effective_month date not null,
  created_at timestamptz not null default now(),
  unique (user_id, effective_month)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'MoreHorizontal',
  category_type text not null default 'expense'
    check (category_type in ('expense', 'income', 'both')),
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null,
  category_id uuid references public.categories(id) on delete set null,
  necessity_type text check (necessity_type in ('essential', 'non_essential') or necessity_type is null),
  billing_day integer not null check (billing_day between 1 and 31),
  recurrence text not null default 'monthly'
    check (recurrence in ('monthly', 'weekly', 'yearly')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  transaction_type text not null check (transaction_type in ('income', 'expense', 'reserve')),
  category_id uuid references public.categories(id) on delete set null,
  necessity_type text check (necessity_type in ('essential', 'non_essential') or necessity_type is null),
  transaction_date date not null default current_date,
  notes text,
  is_recurring boolean not null default false,
  recurring_transaction_id uuid references public.recurring_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  monthly_limit numeric(14,2) not null check (monthly_limit >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  target_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reserve_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  type text not null check (type in ('deposit', 'withdrawal')),
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_transactions_user_date
  on public.transactions (user_id, transaction_date desc);
create index if not exists idx_transactions_user_type
  on public.transactions (user_id, transaction_type);
create index if not exists idx_categories_user
  on public.categories (user_id);
create index if not exists idx_recurring_user
  on public.recurring_transactions (user_id);
create index if not exists idx_reserve_user_date
  on public.reserve_transactions (user_id, transaction_date desc);
create index if not exists idx_salary_history_user
  on public.salary_history (user_id, effective_month desc);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists recurring_updated_at on public.recurring_transactions;
create trigger recurring_updated_at
  before update on public.recurring_transactions
  for each row execute function public.set_updated_at();

drop trigger if exists budgets_updated_at on public.category_budgets;
create trigger budgets_updated_at
  before update on public.category_budgets
  for each row execute function public.set_updated_at();

drop trigger if exists goals_updated_at on public.goals;
create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed default categories for a user
create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, category_type)
  values
    (p_user_id, 'Moradia', 'Home', 'expense'),
    (p_user_id, 'Alimentação', 'Utensils', 'expense'),
    (p_user_id, 'Transporte', 'Car', 'expense'),
    (p_user_id, 'Saúde', 'HeartPulse', 'expense'),
    (p_user_id, 'Lazer', 'Smile', 'expense'),
    (p_user_id, 'Compras', 'ShoppingBag', 'expense'),
    (p_user_id, 'Assinaturas', 'Repeat', 'expense'),
    (p_user_id, 'Educação', 'GraduationCap', 'expense'),
    (p_user_id, 'Contas', 'FileText', 'expense'),
    (p_user_id, 'Investimentos', 'TrendingUp', 'both'),
    (p_user_id, 'Besteiras', 'Candy', 'expense'),
    (p_user_id, 'Outros', 'MoreHorizontal', 'both'),
    (p_user_id, 'Salário', 'Wallet', 'income'),
    (p_user_id, 'Freelance', 'Briefcase', 'income'),
    (p_user_id, 'Extra', 'PlusCircle', 'income')
  on conflict do nothing;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.salary_history enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.category_budgets enable row level security;
alter table public.goals enable row level security;
alter table public.reserve_transactions enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Generic owner policies helper pattern
create policy "salary_history_all_own" on public.salary_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recurring_all_own" on public.recurring_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_all_own" on public.category_budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reserve_all_own" on public.reserve_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
