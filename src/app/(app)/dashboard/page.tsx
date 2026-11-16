import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { DonutSlice } from "@/components/dashboard/expense-donut-chart";
import type { MonthlyTotals } from "@/components/dashboard/income-expense-bar-chart";
import type { DailyTotals } from "@/components/dashboard/daily-flow-chart";
import type { RecurringReminder } from "@/components/dashboard/recurring-reminders";
import type { RecentTransaction } from "@/components/dashboard/recent-transactions";
import { currentCompetencia, monthShortLabel } from "@/lib/format";
import { todayInBrazil } from "@/lib/dates";
import type { RecurringTransactionWithCategory, TransactionWithCategory } from "@/lib/types/database";

const CATEGORY_FALLBACK_COLOR = "#6b6b8a";
const MONTHS_IN_TREND = 6;
const RECENT_TRANSACTIONS_LIMIT = 6;
const ADS_CATEGORY_NAME = "anuncios";

function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

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

function percentChange(current: number, previous: number | undefined) {
  return previous ? (current - previous) / previous : null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ competencia?: string }>;
}) {
  const params = await searchParams;
  const competencia = params.competencia ?? currentCompetencia();
  const previousCompetencia = shiftCompetencia(competencia, -1);
  const nextCompetencia = shiftCompetencia(competencia, 1);

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
  // Sem despesas não há investimento sobre o qual calcular o retorno.
  const roi = totalExpense > 0 ? totalIncome / totalExpense : null;

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

  const adsExpense = donutData
    .filter((slice) => normalizeCategoryName(slice.name) === ADS_CATEGORY_NAME)
    .reduce((sum, slice) => sum + slice.value, 0);
  const adsRoi = adsExpense > 0 ? totalIncome / adsExpense : null;

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
  const previousTotals = monthlyTotals.get(previousCompetencia);

  const [competenciaYear, competenciaMonth] = competencia.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(competenciaYear, competenciaMonth, 0)).getUTCDate();
  const dailyTotals = new Map<string, { date: string; day: string; income: number; expense: number }>();
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
  // Dias que ainda não chegaram ficam vazios no gráfico, em vez de aparecer como R$ 0.
  const today = todayInBrazil();
  const dailyData: DailyTotals[] = [...dailyTotals.values()].map((d) =>
    d.date > today && d.income === 0 && d.expense === 0
      ? { ...d, income: null, expense: null }
      : d
  );

  const recentTransactions: RecentTransaction[] = [...monthTransactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
    .slice(0, RECENT_TRANSACTIONS_LIMIT)
    .map((t) => ({
      id: t.id,
      description: t.description,
      categoryName: t.category?.name ?? null,
      categoryColor: t.category?.color ?? null,
      type: t.type,
      amount: t.amount,
      date: t.date,
    }));

  return (
    <DashboardView
      firstName={firstName}
      competencia={competencia}
      previousCompetencia={previousCompetencia}
      nextCompetencia={nextCompetencia}
      loadError={Boolean(error)}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      saldo={saldo}
      incomeChange={percentChange(totalIncome, previousTotals?.income)}
      expenseChange={percentChange(totalExpense, previousTotals?.expense)}
      roi={roi}
      adsRoi={adsRoi}
      donutData={donutData}
      barData={barData}
      dailyData={dailyData}
      recentTransactions={recentTransactions}
      recurringReminders={recurringReminders}
    />
  );
}
