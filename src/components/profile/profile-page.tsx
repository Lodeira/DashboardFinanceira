"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  PiggyBank,
  Repeat,
  Settings2,
  Tags,
  UserRound,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Avatar } from "@/components/layout/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/money";
import { useFinance } from "@/providers/finance-provider";
import { toast } from "sonner";
import Link from "next/link";
import { getCommittedAmount } from "@/lib/finance";

export function ProfilePage() {
  const { profile, recurring, categories, updateProfile, signOut, demoMode } =
    useFinance();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [salary, setSalary] = useState(Number(profile?.monthly_salary ?? 0));
  const [payday, setPayday] = useState(profile?.payday ?? 5);
  const [goal, setGoal] = useState(Number(profile?.monthly_savings_goal ?? 0));
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const committed = getCommittedAmount(recurring);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        monthly_salary: salary,
        payday,
        monthly_savings_goal: goal,
      });
      setSettingsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const links = [
    {
      label: "Dados pessoais e salário",
      icon: UserRound,
      onClick: () => {
        setName(profile.name);
        setSalary(Number(profile.monthly_salary));
        setPayday(profile.payday);
        setGoal(Number(profile.monthly_savings_goal));
        setSettingsOpen(true);
      },
    },
    {
      label: "Minha reserva",
      icon: PiggyBank,
      href: "/reserve",
    },
    {
      label: "Gastos recorrentes",
      icon: Repeat,
      detail: `${formatCurrency(committed)} / mês`,
    },
    {
      label: "Categorias",
      icon: Tags,
      detail: `${categories.length} categorias`,
    },
    {
      label: "Preferências",
      icon: Settings2,
      detail: demoMode ? "Modo demonstração" : "Conta conectada",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-28 lg:pb-10">
      <AppHeader title="Perfil" subtitle="Configurações e preferências." />

      <section className="card-surface flex items-center gap-4 p-5">
        <Avatar name={profile.name} size="lg" />
        <div>
          <p className="text-xl font-semibold text-text-primary">{profile.name}</p>
          <p className="text-sm text-text-secondary">
            Salário · {formatCurrency(Math.round(Number(profile.monthly_salary) * 100))}
          </p>
          <p className="text-sm text-text-secondary">
            Pagamento no dia {profile.payday}
          </p>
        </div>
      </section>

      <section className="card-surface divide-y divide-border/70 overflow-hidden">
        {links.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex w-full items-center gap-3 px-4 py-4 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-primary-medium">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{item.label}</p>
                {item.detail ? (
                  <p className="text-xs text-text-secondary">{item.detail}</p>
                ) : null}
              </div>
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className="w-full hover:bg-muted/50"
              onClick={item.onClick}
            >
              {content}
            </button>
          );
        })}
      </section>

      <section className="card-surface p-5">
        <p className="text-sm font-medium text-text-secondary">Compromissos ativos</p>
        <div className="mt-3 space-y-3">
          {recurring.filter((r) => r.active).map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{r.description}</p>
                <p className="text-xs text-text-secondary">
                  Dia {r.billing_day}
                  {r.necessity_type === "essential" ? " · Essencial" : ""}
                </p>
              </div>
              <p className="font-semibold text-balance-num">
                {formatCurrency(Math.round(Number(r.amount) * 100))}
              </p>
            </div>
          ))}
          {recurring.filter((r) => r.active).length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhum gasto recorrente cadastrado.
            </p>
          ) : null}
        </div>
      </section>

      <Button
        variant="secondary"
        className="w-full text-danger"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>

      <BottomSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Configurações"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <CurrencyInput
            label="Salário mensal"
            value={salary}
            onChange={setSalary}
          />
          <Input
            label="Dia do pagamento"
            type="number"
            min={1}
            max={31}
            value={payday}
            onChange={(e) => setPayday(Number(e.target.value))}
          />
          <CurrencyInput
            label="Meta mensal de economia"
            value={goal}
            onChange={setGoal}
          />
          <Button
            size="lg"
            className="w-full"
            disabled={saving}
            onClick={() => void handleSaveSettings()}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
