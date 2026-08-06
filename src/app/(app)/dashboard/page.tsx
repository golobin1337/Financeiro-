import Link from "next/link";
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpenseDonutChart, type DonutSlice } from "@/components/dashboard/expense-donut-chart";
import {
  IncomeExpenseBarChart,
  type MonthlyTotals,
} from "@/components/dashboard/income-expense-bar-chart";
import { DailyFlowChart, type DailyTotals } from "@/components/dashboard/daily-flow-chart";
import {
  RecurringReminders,
  type RecurringReminder,
} from "@/components/dashboard/recurring-reminders";
import { currentCompetencia, formatCurrency, monthShortLabel } from "@/lib/format";
import type { RecurringTransactionWithCategory, TransactionWithCategory } from "@/lib/types/database";

const CATEGORY_FALLBACK_COLOR = "#6b6b8a";
const MONTHS_IN_TREND = 6;

function monthRange(competencia: string) {
  const [year, month] = competencia.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function shiftCompetencia(competencia: string, offset: number) {
  const [year, month] = competencia.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ competencia?: string }>;
}) {
  const params = await searchParams;
  const competencia = params.competencia ?? currentCompetencia();

  const supabase = await createClient();
  const user = await getCurrentUser();
  const firstName = (
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    ""
  ).split(" ")[0];

  const trendStart = shiftCompetencia(competencia, -(MONTHS_IN_TREND - 1));
  const { start: trendStartDate } = monthRange(trendStart);
  const { end: trendEndDate } = monthRange(competencia);

  const [{ data, error }, { data: recurringData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .gte("date", trendStartDate)
      .lt("date", trendEndDate)
      .order("date", { ascending: true }),
    supabase
      .from("recurring_transactions")
      .select("*, category:categories(*)")
      .eq("active", true),
  ]);

  const transactions = (data ?? []) as TransactionWithCategory[];
  const { start: monthStart, end: monthEnd } = monthRange(competencia);
  const monthTransactions = transactions.filter(
    (t) => t.date >= monthStart && t.date < monthEnd
  );

  const recurring = (recurringData ?? []) as RecurringTransactionWithCategory[];
  const recurringReminders: RecurringReminder[] = [];
  for (const r of recurring) {
    const matched = monthTransactions.find((t) => t.recurring_id === r.id);
    if (matched) {
      recurringReminders.push({
        id: r.id,
        description: matched.description || r.description,
        categoryName: r.category?.name ?? null,
        categoryColor: r.category?.color ?? null,
        amount: matched.amount,
        type: matched.type,
        date: matched.date,
        status: "pago",
      });
    } else if (r.next_date >= monthStart && r.next_date < monthEnd) {
      recurringReminders.push({
        id: r.id,
        description: r.description,
        categoryName: r.category?.name ?? null,
        categoryColor: r.category?.color ?? null,
        amount: r.amount,
        type: r.type,
        date: r.next_date,
        status: "pendente",
      });
    }
  }
  recurringReminders.sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalIncome - totalExpense;

  const expenseByCategory = new Map<string, DonutSlice>();
  for (const t of monthTransactions) {
    if (t.type !== "expense") continue;
    const key = t.category?.id ?? "sem-categoria";
    const existing = expenseByCategory.get(key);
    if (existing) {
      existing.value += t.amount;
    } else {
      expenseByCategory.set(key, {
        id: key,
        name: t.category?.name ?? "Sem categoria",
        color: t.category?.color ?? CATEGORY_FALLBACK_COLOR,
        value: t.amount,
      });
    }
  }
  const donutData = [...expenseByCategory.values()].sort((a, b) => b.value - a.value);

  const monthlyTotals = new Map<string, MonthlyTotals>();
  for (let i = 0; i < MONTHS_IN_TREND; i++) {
    const key = shiftCompetencia(trendStart, i);
    monthlyTotals.set(key, { month: key, label: monthShortLabel(key), income: 0, expense: 0 });
  }
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    const bucket = monthlyTotals.get(key);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expense += t.amount;
  }
  const barData = [...monthlyTotals.values()];

  const [competenciaYear, competenciaMonth] = competencia.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(competenciaYear, competenciaMonth, 0)).getUTCDate();
  const dailyTotals = new Map<string, DailyTotals>();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${competencia}-${String(day).padStart(2, "0")}`;
    dailyTotals.set(date, { date, day: String(day).padStart(2, "0"), income: 0, expense: 0 });
  }
  for (const t of monthTransactions) {
    const bucket = dailyTotals.get(t.date);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expense += t.amount;
  }
  const dailyData = [...dailyTotals.values()];

  const previousCompetencia = shiftCompetencia(competencia, -1);
  const nextCompetencia = shiftCompetencia(competencia, 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-muted">Resumo financeiro do mês</p>
        </div>

        <form method="get" className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="competencia" className="text-sm text-muted">
              Competência
            </label>
            <input
              id="competencia"
              name="competencia"
              type="month"
              defaultValue={competencia}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
          >
            Carregar
          </button>
          <Link
            href="/transacao/nova"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            + Transação
          </Link>
        </form>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={`/dashboard?competencia=${previousCompetencia}`}
          className="rounded-md px-2 py-1 hover:bg-surface-hover hover:text-foreground"
        >
          ← mês anterior
        </Link>
        <Link
          href={`/dashboard?competencia=${nextCompetencia}`}
          className="rounded-md px-2 py-1 hover:bg-surface-hover hover:text-foreground"
        >
          próximo mês →
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          Não foi possível ligar ao servidor. Verifique a ligação ou tente mais tarde.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Saldo do mês" value={formatCurrency(saldo)} icon={Wallet} />
        <StatCard
          label="Receitas"
          value={formatCurrency(totalIncome)}
          tone="success"
          icon={TrendingUp}
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(totalExpense)}
          tone="danger"
          icon={TrendingDown}
        />
      </div>

      <RecurringReminders items={recurringReminders} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <PieChartIcon size={16} className="text-primary" />
            Gastos por categoria
          </h2>
          <ExpenseDonutChart data={donutData} />
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BarChart3 size={16} className="text-primary" />
            Receitas vs. despesas
          </h2>
          <IncomeExpenseBarChart data={barData} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <LineChartIcon size={16} className="text-primary" />
          Gasto e faturamento por dia
        </h2>
        <DailyFlowChart data={dailyData} />
      </div>
    </div>
  );
}
