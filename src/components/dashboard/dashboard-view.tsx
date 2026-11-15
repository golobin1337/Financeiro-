import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Card, CardHeader, CardPill } from "@/components/ui/card";
import { BalanceHeroCard } from "@/components/dashboard/balance-hero-card";
import { MonthSummaryCard } from "@/components/dashboard/month-summary-card";
import { RoiCard } from "@/components/dashboard/roi-card";
import {
  RecentTransactions,
  type RecentTransaction,
} from "@/components/dashboard/recent-transactions";
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
import { monthLabel, monthShortLabel } from "@/lib/format";

export interface DashboardViewProps {
  firstName: string;
  competencia: string;
  previousCompetencia: string;
  nextCompetencia: string;
  loadError: boolean;
  totalIncome: number;
  totalExpense: number;
  saldo: number;
  incomeChange: number | null;
  expenseChange: number | null;
  roi: number | null;
  adsRoi: number | null;
  donutData: DonutSlice[];
  barData: MonthlyTotals[];
  dailyData: DailyTotals[];
  recentTransactions: RecentTransaction[];
  recurringReminders: RecurringReminder[];
}

export function DashboardView(props: DashboardViewProps) {
  const { competencia, previousCompetencia, nextCompetencia, recurringReminders } = props;
  const competenciaLabel = monthLabel(competencia);
  const hasReminders = recurringReminders.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá{props.firstName ? `, ${props.firstName}` : ""}!
          </h1>
          <p className="text-muted">Resumo financeiro de {competenciaLabel.toLowerCase()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form
            method="get"
            className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1"
          >
            <Link
              href={`/dashboard?competencia=${previousCompetencia}`}
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </Link>
            <label htmlFor="competencia" className="sr-only">
              Competência
            </label>
            <input
              id="competencia"
              name="competencia"
              type="month"
              defaultValue={competencia}
              className="bg-transparent px-2 py-1 text-sm outline-none"
            />
            <Link
              href={`/dashboard?competencia=${nextCompetencia}`}
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronRight size={16} />
            </Link>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-surface-hover"
            >
              Carregar
            </button>
          </form>
          <Link
            href="/transacao/nova"
            className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover sm:block"
          >
            + Transação
          </Link>
        </div>
      </header>

      {props.loadError && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          Não foi possível ligar ao servidor. Verifique a ligação ou tente mais tarde.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <BalanceHeroCard
          className="lg:col-span-4"
          saldo={props.saldo}
          competenciaLabel={competenciaLabel}
        />
        <MonthSummaryCard
          className="lg:col-span-5"
          income={props.totalIncome}
          expense={props.totalExpense}
          incomeChange={props.incomeChange}
          expenseChange={props.expenseChange}
          previousLabel={monthShortLabel(previousCompetencia)}
        />
        <RoiCard
          className="lg:col-span-3"
          roi={props.roi}
          adsRoi={props.adsRoi}
          income={props.totalIncome}
          expense={props.totalExpense}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader
            icon={BarChart3}
            title="Receitas vs. despesas"
            action={<CardPill>Últimos 6 meses</CardPill>}
          />
          <div className="relative min-h-72 flex-1">
            <div className="absolute inset-0">
              <IncomeExpenseBarChart data={props.barData} />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col lg:col-span-5">
          <CardHeader
            icon={PieChartIcon}
            title="Gastos por categoria"
            action={<CardPill>{competenciaLabel}</CardPill>}
          />
          <div className="min-h-0 flex-1">
            <ExpenseDonutChart data={props.donutData} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <RecentTransactions
          className={hasReminders ? "lg:col-span-8" : "lg:col-span-12"}
          items={props.recentTransactions}
        />
        {hasReminders && (
          <div className="min-w-0 lg:col-span-4">
            <RecurringReminders items={recurringReminders} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader icon={LineChartIcon} title="Gasto e faturamento por dia" />
        <DailyFlowChart data={props.dailyData} />
      </Card>
    </div>
  );
}
