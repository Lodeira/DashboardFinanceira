"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, fromCents } from "@/lib/utils/money";

interface ReserveChartProps {
  data: { label: string; value: number }[];
}

export function ReserveChart({ data }: ReserveChartProps) {
  const chartData = data.map((d) => ({
    label: d.label,
    Reserva: fromCents(d.value),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
          <Line
            type="monotone"
            dataKey="Reserva"
            stroke="#0B2348"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#74B8EA", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
