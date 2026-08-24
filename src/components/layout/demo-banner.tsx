"use client";

import { useFinance } from "@/providers/finance-provider";

export function DemoBanner() {
  const { demoMode } = useFinance();
  if (!demoMode) return null;

  return (
    <div className="bg-warning-soft px-4 py-2 text-center text-xs font-medium text-warning">
      Modo demonstração — dados mockados. Configure o Supabase para salvar dados reais.
    </div>
  );
}
