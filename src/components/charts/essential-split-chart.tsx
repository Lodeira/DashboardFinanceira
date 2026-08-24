"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/money";

interface EssentialSplitChartProps {
  essentialCents: number;
  nonEssentialCents: number;
}

export function EssentialSplitChart({
  essentialCents,
  nonEssentialCents,
}: EssentialSplitChartProps) {
  const total = essentialCents + nonEssentialCents;
  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-text-secondary">
        Sem dados suficientes.
      </div>
    );
  }

  const data = [
    { name: "Essencial", value: essentialCents },
    { name: "Não essencial", value: nonEssentialCents },
  ];

  const essentialPct = (essentialCents / total) * 100;
  const nonEssentialPct = (nonEssentialCents / total) * 100;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              strokeWidth={0}
            >
              <Cell fill="#174477" />
              <Cell fill="#74B8EA" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 w-full max-w-xs">
        <div className="rounded-2xl bg-muted px-4 py-3">
          <p className="text-xs text-text-secondary">Essencial</p>
          <p className="font-semibold text-primary">
            {essentialPct.toFixed(0)}% · {formatCurrency(essentialCents)}
          </p>
        </div>
        <div className="rounded-2xl bg-muted px-4 py-3">
          <p className="text-xs text-text-secondary">Não essencial</p>
          <p className="font-semibold text-primary-medium">
            {nonEssentialPct.toFixed(0)}% · {formatCurrency(nonEssentialCents)}
          </p>
        </div>
      </div>
    </div>
  );
}
