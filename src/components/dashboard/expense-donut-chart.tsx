"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useChartTheme } from "@/lib/use-chart-theme";

export interface DonutSlice {
  id: string;
  name: string;
  color: string;
  value: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DonutSlice }[];
}) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="font-medium">{slice.name}</p>
      <p className="text-muted">{formatCurrency(slice.value)}</p>
    </div>
  );
}

export function ExpenseDonutChart({ data }: { data: DonutSlice[] }) {
  const chartTheme = useChartTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted">
        <PieChartIcon size={28} className="opacity-40" />
        Nenhuma despesa registrada nesta competência.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke={chartTheme.surface}
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {data.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="flex-1 truncate">{slice.name}</span>
            <span className="text-muted">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
            <span className="w-20 text-right font-medium">
              {formatCurrency(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
