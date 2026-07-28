"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useChartTheme } from "@/lib/use-chart-theme";

export interface DailyTotals {
  date: string;
  day: string;
  income: number;
  expense: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; payload: DailyTotals }[];
}) {
  if (!active || !payload?.length) return null;
  const date = payload[0].payload.date;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium">{formatDate(date)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted">
          {entry.dataKey === "income" ? "Faturamento" : "Gasto"}:{" "}
          <span className="text-foreground">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function DailyFlowChart({ data }: { data: DailyTotals[] }) {
  const chartTheme = useChartTheme();
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted">
        <LineChartIcon size={28} className="opacity-40" />
        Sem transações nesta competência.
      </div>
    );
  }

  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} stroke={chartTheme.border} strokeDasharray="0" />
          <XAxis
            dataKey="day"
            stroke={chartTheme.muted}
            tickLine={false}
            axisLine={{ stroke: chartTheme.border }}
            fontSize={12}
            interval={tickInterval}
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
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: chartTheme.muted, strokeWidth: 1 }}
          />
          <Legend
            formatter={(value) => (value === "income" ? "Faturamento" : "Gasto")}
            wrapperStyle={{ fontSize: 12, color: chartTheme.muted }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="income"
            stroke={chartTheme.income}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="expense"
            stroke={chartTheme.expense}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
