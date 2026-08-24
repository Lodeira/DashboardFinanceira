"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/lib/config";
import { isDemoMode, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/schemas";
import { useFinance } from "@/providers/finance-provider";
import { toast } from "sonner";

export function LoginPage() {
  const router = useRouter();
  const { signInDemo } = useFinance();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    if (!isSupabaseConfigured()) {
      toast.error("Configure o Supabase ou use o modo demonstração.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: appConfig.defaultUserName },
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Você já pode entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível autenticar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  function enterDemo() {
    signInDemo();
    router.replace("/");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#b9ddf7_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#74b8ea55_0%,transparent_35%),linear-gradient(#eaf5ff,#dceefc)]" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo size={56} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary">
            {appConfig.name}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {appConfig.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-surface space-y-4 p-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-sm text-text-secondary">
              Use e-mail e senha para acessar suas finanças.
            </p>
          </div>

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </Button>

          <button
            type="button"
            className="w-full text-center text-sm text-primary-medium"
            onClick={() =>
              setMode((m) => (m === "login" ? "signup" : "login"))
            }
          >
            {mode === "login"
              ? "Não tem conta? Criar conta"
              : "Já tem conta? Entrar"}
          </button>
        </form>

        {isDemoMode() ? (
          <div className="mt-4 card-surface p-4 text-center">
            <p className="text-sm text-text-secondary">
              Supabase ainda não configurado.
            </p>
            <Button
              variant="soft"
              className="mt-3 w-full"
              onClick={enterDemo}
            >
              Entrar no modo demonstração
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
