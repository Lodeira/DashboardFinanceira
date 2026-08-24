"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, fromCents } from "@/lib/utils/money";

interface SavingsChartProps {
  data: { label: string; value: number }[];
}

export function SavingsChart({ data }: SavingsChartProps) {
  const chartData = data.map((d) => ({
    label: d.label,
    Economia: fromCents(Math.max(0, d.value)),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#74B8EA" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#74B8EA" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            width={40}
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
              }).format(v)
            }
          />
          <Tooltip
            formatter={(value) => formatCurrency(Math.round(Number(value) * 100))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #D6E8F7",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="Economia"
            stroke="#174477"
            strokeWidth={2.5}
            fill="url(#savingsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
