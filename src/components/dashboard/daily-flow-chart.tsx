"use client";

import { useId } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatCurrency, formatDate, formatMultiplier } from "@/lib/format";
import { useChartTheme } from "@/lib/use-chart-theme";

export interface DailyTotals {
  date: string;
  day: string;
  /** null nos dias que ainda não chegaram: a barra some e a linha para, em vez de cair a zero. */
  income: number | null;
  expense: number | null;
}

type BarGeometry = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Faixa de fundo da barra: vai do topo do gráfico até a base. */
  background?: { y?: number | null };
};

const CAP_HEIGHT = 3;
const CORNER = 4;

function topRoundedPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(CORNER, width / 2, height);
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
}

function DayBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  background,
  isActive,
  fill,
  capColor,
  activeFill,
  dotStroke,
}: BarGeometry & {
  isActive: boolean;
  fill: string;
  capColor: string;
  activeFill: string;
  dotStroke: string;
}) {
  if (height <= 0 || width <= 0) return <g />;
  const cx = x + width / 2;
  return (
    <g>
      <path d={topRoundedPath(x, y, width, height)} fill={isActive ? activeFill : fill} />
      <rect x={x} y={y} width={width} height={Math.min(CAP_HEIGHT, height)} rx={1.5} fill={capColor} />
      {/* A linha tracejada e o ponto ficam na própria barra ativa, para coincidirem sempre com ela. */}
      {isActive && (
        <>
          <line
            x1={cx}
            x2={cx}
            y1={background?.y ?? y}
            y2={y + height}
            stroke={capColor}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <circle cx={cx} cy={y} r={4} fill={capColor} stroke={dotStroke} strokeWidth={2} />
        </>
      )}
    </g>
  );
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyTotals }[];
}) {
  if (!active || !payload?.length) return null;
  const { date, income, expense } = payload[0].payload;
  if (income === null) return null;
  const roi = expense ? (income ?? 0) / expense : null;

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-lg">
      <p className="text-xs text-muted">{formatDate(date)}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-lg font-semibold">{formatCurrency(income ?? 0)}</p>
        {roi !== null && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              roi >= 1 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            ROI {formatMultiplier(roi)}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        Gasto: <span className="text-foreground">{formatCurrency(expense ?? 0)}</span>
      </p>
    </div>
  );
}

export function DailyFlowChart({ data }: { data: DailyTotals[] }) {
  const chartTheme = useChartTheme();
  const gradientId = `daily-bar-active-${useId().replace(/:/g, "")}`;
  const activeFill = `url(#${gradientId})`;
  const hasData = data.some((d) => (d.income ?? 0) > 0 || (d.expense ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted">
        <BarChart3 size={28} className="opacity-40" />
        Sem transações nesta competência.
      </div>
    );
  }

  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1);

  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }} barCategoryGap="18%">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.primary} stopOpacity={0.85} />
                <stop offset="100%" stopColor={chartTheme.primary} stopOpacity={0.12} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartTheme.border} strokeDasharray="4 4" />
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
              width={48}
              tickFormatter={(v) =>
                new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar
              dataKey="income"
              name="Faturamento"
              maxBarSize={40}
              shape={(props: BarGeometry) => (
                <DayBar {...props} isActive={false} fill={chartTheme.barFill} capColor={chartTheme.primary} activeFill={activeFill} dotStroke={chartTheme.surface} />
              )}
              activeBar={(props: BarGeometry) => (
                <DayBar {...props} isActive fill={chartTheme.barFill} capColor={chartTheme.primary} activeFill={activeFill} dotStroke={chartTheme.surface} />
              )}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Gasto"
              stroke={chartTheme.expense}
              strokeWidth={1.5}
              strokeDasharray="3 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm border-t-2 border-primary"
            style={{ backgroundColor: chartTheme.barFill }}
          />
          Faturamento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed" style={{ borderColor: chartTheme.expense }} />
          Gasto
        </span>
      </div>
    </div>
  );
}
