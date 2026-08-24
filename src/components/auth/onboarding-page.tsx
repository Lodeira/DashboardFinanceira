"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import { useFinance } from "@/providers/finance-provider";
import { toast } from "sonner";

export function OnboardingPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useFinance();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(
    profile?.name || appConfig.defaultUserName
  );
  const [salary, setSalary] = useState(3500);
  const [payday, setPayday] = useState(5);
  const [initialSavings, setInitialSavings] = useState(5000);
  const [goalType, setGoalType] = useState<"fixed" | "percent">("fixed");
  const [goalValue, setGoalValue] = useState(700);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    try {
      await completeOnboarding({
        name: name.trim(),
        monthlySalary: salary,
        payday,
        initialSavings,
        goalType,
        monthlySavingsGoal: goalValue,
      });
      router.replace("/");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível concluir o onboarding.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#b9ddf7_0%,transparent_45%),linear-gradient(#eaf5ff,#d9ecfb)]" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {step === 0 ? (
          <div className="card-surface p-6 text-center">
            <p className="text-4xl">👋</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary">
              {name.trim()
                ? `Olá, ${name.trim().split(" ")[0]}`
                : "Olá"}
            </h1>
            <p className="mt-3 text-text-secondary">
              Vamos organizar sua vida financeira com o {appConfig.name}.
            </p>
            <Button size="lg" className="mt-8 w-full" onClick={() => setStep(1)}>
              Começar
            </Button>
          </div>
        ) : (
          <div className="card-surface space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-accent">
                Passo {step} de 5
              </p>
              <h2 className="mt-1 text-xl font-semibold text-text-primary">
                {step === 1 && "Como podemos te chamar?"}
                {step === 2 && "Qual é o seu salário mensal?"}
                {step === 3 && "Qual o dia do pagamento?"}
                {step === 4 && "Quanto você já tem guardado?"}
                {step === 5 && "Qual sua meta de economia mensal?"}
              </h2>
            </div>

            {step === 1 ? (
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            ) : null}

            {step === 2 ? (
              <CurrencyInput
                label="Salário mensal"
                value={salary}
                onChange={setSalary}
                large
                autoFocus
              />
            ) : null}

            {step === 3 ? (
              <Input
                label="Dia do pagamento"
                type="number"
                min={1}
                max={31}
                value={payday}
                onChange={(e) => setPayday(Number(e.target.value))}
                autoFocus
              />
            ) : null}

            {step === 4 ? (
              <CurrencyInput
                label="Já guardado"
                value={initialSavings}
                onChange={setInitialSavings}
                large
                autoFocus
              />
            ) : null}

            {step === 5 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
                  <button
                    type="button"
                    className={cn(
                      "h-11 rounded-xl text-sm font-medium",
                      goalType === "fixed"
                        ? "bg-white text-primary shadow-card"
                        : "text-text-secondary"
                    )}
                    onClick={() => {
                      setGoalType("fixed");
                      setGoalValue(700);
                    }}
                  >
                    Valor em R$
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "h-11 rounded-xl text-sm font-medium",
                      goalType === "percent"
                        ? "bg-white text-primary shadow-card"
                        : "text-text-secondary"
                    )}
                    onClick={() => {
                      setGoalType("percent");
                      setGoalValue(20);
                    }}
                  >
                    % do salário
                  </button>
                </div>
                {goalType === "fixed" ? (
                  <CurrencyInput
                    label="Meta mensal"
                    value={goalValue}
                    onChange={setGoalValue}
                    large
                  />
                ) : (
                  <Input
                    label="Percentual"
                    type="number"
                    min={1}
                    max={100}
                    value={goalValue}
                    onChange={(e) => setGoalValue(Number(e.target.value))}
                  />
                )}
              </div>
            ) : null}

            <div className="flex gap-3">
              {step > 1 ? (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Voltar
                </Button>
              ) : null}
              {step < 5 ? (
                <Button
                  className="flex-1"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  disabled={saving}
                  onClick={() => void handleFinish()}
                >
                  {saving ? "Salvando..." : "Começar"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
