"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useChartTheme } from "@/lib/use-chart-theme";

export interface AnnualFlow {
  month: string;
  label: string;
  /** null nos meses que ainda não chegaram: a área para em vez de cair a zero. */
  income: number | null;
  expense: number | null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number | null; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
  const saldo = (income ?? 0) - (expense ?? 0);

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-lg">
      <p className="mb-1 font-medium">{label}</p>
      <p className="text-muted">
        Faturamento: <span className="text-success">{formatCurrency(income ?? 0)}</span>
      </p>
      <p className="text-muted">
        Gasto: <span className="text-danger">{formatCurrency(expense ?? 0)}</span>
      </p>
      <p className="mt-1 border-t border-border pt-1 text-muted">
        Saldo:{" "}
        <span className={saldo >= 0 ? "text-success" : "text-danger"}>
          {formatCurrency(saldo)}
        </span>
      </p>
    </div>
  );
}

export function AnnualFlowChart({ data }: { data: AnnualFlow[] }) {
  const chartTheme = useChartTheme();
  const uid = useId().replace(/:/g, "");
  const incomeGradient = `annual-income-${uid}`;
  const expenseGradient = `annual-expense-${uid}`;
  const hasData = data.some((d) => (d.income ?? 0) > 0 || (d.expense ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted">
        <BarChart3 size={28} className="opacity-40" />
        Sem transações neste ano.
      </div>
    );
  }

  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id={incomeGradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.income} stopOpacity={0.35} />
                <stop offset="100%" stopColor={chartTheme.income} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={expenseGradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.expense} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartTheme.expense} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartTheme.border} strokeDasharray="4 4" />
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
              width={48}
              tickFormatter={(v) =>
                new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: chartTheme.muted, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Faturamento"
              stroke={chartTheme.income}
              strokeWidth={2}
              fill={`url(#${incomeGradient})`}
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Gasto"
              stroke={chartTheme.expense}
              strokeWidth={2}
              fill={`url(#${expenseGradient})`}
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: chartTheme.income }} />
          Faturamento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: chartTheme.expense }} />
          Gasto
        </span>
      </div>
    </div>
  );
}
