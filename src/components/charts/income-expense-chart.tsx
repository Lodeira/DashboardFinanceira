"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, fromCents } from "@/lib/utils/money";

interface IncomeExpenseChartProps {
  data: { label: string; income: number; expense: number }[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const chartData = data.map((d) => ({
    label: d.label,
    Receitas: fromCents(d.income),
    Despesas: fromCents(d.expense),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#667085", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#667085", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
            width={40}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Math.round(Number(value) * 100))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #D6E8F7",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#667085" }}
            iconType="circle"
          />
          <Bar dataKey="Receitas" fill="#12B76A" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Despesas" fill="#74B8EA" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
