"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils/money";

const COLORS = ["#0B2348", "#174477", "#74B8EA", "#B9DDF7", "#4A90C8", "#2E5A8A"];

interface CategoryDonutChartProps {
  totalCents: number;
  data: { name: string; value: number }[];
}

export function CategoryDonutChart({ totalCents, data }: CategoryDonutChartProps) {
  const chartData = data.filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-text-secondary">
        Sem gastos neste período.
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-56 w-full max-w-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={68}
            outerRadius={92}
            paddingAngle={3}
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #D6E8F7",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-text-secondary">Gastos</p>
        <p className="text-lg font-semibold text-primary text-balance-num">
          {formatCurrency(totalCents)}
        </p>
      </div>
    </div>
  );
}
