import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, LayoutGrid, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function ChangeBadge({
  change,
  goodWhenUp,
  previousLabel,
}: {
  change: number | null;
  goodWhenUp: boolean;
  previousLabel: string;
}) {
  if (change === null) {
    return <p className="text-xs text-muted">Sem dados de {previousLabel}</p>;
  }

  const up = change >= 0;
  const good = up === goodWhenUp;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <span
        className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
          good ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        }`}
      >
        <Arrow size={12} />
        {Math.round(Math.abs(change) * 100)}%
      </span>
      vs. {previousLabel}
    </p>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  tone,
  change,
  goodWhenUp,
  previousLabel,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "success" | "danger";
  change: number | null;
  goodWhenUp: boolean;
  previousLabel: string;
}) {
  const toneClass = tone === "success" ? "text-success" : "text-danger";
  const badgeClass = tone === "success" ? "bg-success/10" : "bg-danger/10";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${badgeClass} ${toneClass}`}>
          <Icon size={14} />
        </span>
        {label}
      </div>
      <p className={`text-xl font-semibold tracking-tight whitespace-nowrap 2xl:text-2xl ${toneClass}`}>
        {formatCurrency(value)}
      </p>
      <ChangeBadge change={change} goodWhenUp={goodWhenUp} previousLabel={previousLabel} />
    </div>
  );
}

export function MonthSummaryCard({
  income,
  expense,
  incomeChange,
  expenseChange,
  previousLabel,
  className = "",
}: {
  income: number;
  expense: number;
  incomeChange: number | null;
  expenseChange: number | null;
  previousLabel: string;
  className?: string;
}) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader
        icon={LayoutGrid}
        title="Resumo do mês"
        action={
          <Link
            href="/historico"
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            Ver histórico
          </Link>
        }
      />
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <SummaryTile
          label="Receitas"
          value={income}
          icon={TrendingUp}
          tone="success"
          change={incomeChange}
          goodWhenUp
          previousLabel={previousLabel}
        />
        <SummaryTile
          label="Despesas"
          value={expense}
          icon={TrendingDown}
          tone="danger"
          change={expenseChange}
          goodWhenUp={false}
          previousLabel={previousLabel}
        />
      </div>
    </Card>
  );
}
