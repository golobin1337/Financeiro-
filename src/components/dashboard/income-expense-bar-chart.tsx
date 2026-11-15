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
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useChartTheme } from "@/lib/use-chart-theme";

export interface MonthlyTotals {
  month: string;
  label: string;
  income: number;
  expense: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted">
          {entry.dataKey === "income" ? "Receitas" : "Despesas"}:{" "}
          <span className="text-foreground">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseBarChart({ data }: { data: MonthlyTotals[] }) {
  const chartTheme = useChartTheme();
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted">
        <BarChart3 size={28} className="opacity-40" />
        Sem transações no período.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} barCategoryGap="24%">
          <CartesianGrid
            vertical={false}
            stroke={chartTheme.border}
            strokeDasharray="0"
          />
          <XAxis
            dataKey="label"
            stroke={chartTheme.muted}
            tickLine={false}
            axisLine={{ stroke: chartTheme.border }}
            fontSize={12}
          />
          <YAxis
            stroke={chartTheme.muted}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={40}
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)
            }
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: chartTheme.surface }} />
          <Legend
            formatter={(value) => (value === "income" ? "Receitas" : "Despesas")}
            wrapperStyle={{ fontSize: 12, color: chartTheme.muted }}
          />
          <Bar
            dataKey="income"
            name="income"
            fill={chartTheme.income}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="expense"
            name="expense"
            fill={chartTheme.expense}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
