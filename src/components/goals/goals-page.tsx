"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { GoalCard } from "@/components/goals/goal-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getMonthlySavings,
  getSavingsGoalProgress,
  mapGoalProgress,
  resolveMonthlySalary,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/money";
import { useFinance } from "@/providers/finance-provider";
import { Target } from "lucide-react";
import { toast } from "sonner";
import type { Goal } from "@/types/database";

export function GoalsPage() {
  const {
    profile,
    goals,
    transactions,
    salaryHistory,
    selectedMonth,
    addGoal,
    updateGoal,
  } = useFinance();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);

  const monthlyGoal = useMemo(() => {
    if (!profile) return null;
    const salary = resolveMonthlySalary(
      Number(profile.monthly_salary),
      salaryHistory,
      selectedMonth
    );
    const saved = Math.max(
      0,
      getMonthlySavings(transactions, salary, selectedMonth)
    );
    const goalCents = Math.round(Number(profile.monthly_savings_goal) * 100);
    return {
      ...getSavingsGoalProgress(saved, goalCents),
      label: `Economizar ${formatCurrency(goalCents)} este mês`,
    };
  }, [profile, transactions, salaryHistory, selectedMonth]);

  const goalRows = mapGoalProgress(goals);

  function openCreate() {
    setEditing(null);
    setName("");
    setTarget(0);
    setCurrent(0);
    setOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditing(goal);
    setName(goal.name);
    setTarget(Number(goal.target_amount));
    setCurrent(Number(goal.current_amount));
    setOpen(true);
  }

  async function handleSave() {
    if (!name.trim() || target <= 0) {
      toast.error("Preencha nome e valor da meta.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateGoal(editing.id, {
          name: name.trim(),
          targetAmount: target,
          currentAmount: current,
        });
      } else {
        await addGoal({
          name: name.trim(),
          targetAmount: target,
          currentAmount: current,
        });
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar a meta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-28 lg:pb-10">
      <AppHeader
        title="Metas"
        subtitle="Acompanhe sua economia e objetivos."
        rightSlot={
          <Button size="sm" onClick={openCreate}>
            Nova meta
          </Button>
        }
      />

      {monthlyGoal ? (
        <section className="card-surface p-5">
          <p className="text-sm text-text-secondary">Meta mensal principal</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {monthlyGoal.label}
          </p>
          <p className="mt-2 text-sm text-text-secondary text-balance-num">
            {formatCurrency(monthlyGoal.current)} /{" "}
            {formatCurrency(monthlyGoal.target)}
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-primary-medium transition-all"
              style={{ width: `${Math.min(100, monthlyGoal.percent)}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-primary">
            {monthlyGoal.percent.toFixed(0)}%
          </p>
        </section>
      ) : null}

      {goalRows.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="Nenhuma meta específica ainda."
          description="Crie metas como viagem, notebook ou reserva de emergência."
          action={<Button onClick={openCreate}>Criar meta</Button>}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {goalRows.map(({ goal, current, target, percent }) => (
            <GoalCard
              key={goal.id}
              name={goal.name}
              currentCents={current}
              targetCents={target}
              percent={percent}
              onEdit={() => openEdit(goal)}
            />
          ))}
        </div>
      )}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar meta" : "Nova meta"}
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Viagem"
          />
          <CurrencyInput
            label="Valor alvo"
            value={target}
            onChange={setTarget}
          />
          <CurrencyInput
            label="Valor atual"
            value={current}
            onChange={setCurrent}
          />
          <Button
            size="lg"
            className="w-full"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Salvando..." : "Salvar meta"}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
