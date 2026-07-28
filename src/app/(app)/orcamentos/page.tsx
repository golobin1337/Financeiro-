import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BudgetCard } from "@/components/budgets/budget-card";
import { currentCompetencia, monthLabel } from "@/lib/format";
import type { Budget, Category, Transaction } from "@/lib/types/database";

function monthRange(competencia: string) {
  const [year, month] = competencia.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    monthDate: start.toISOString().slice(0, 10),
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ competencia?: string }>;
}) {
  const params = await searchParams;
  const competencia = params.competencia ?? currentCompetencia();
  const { monthDate, start, end } = monthRange(competencia);

  const supabase = await createClient();

  const [{ data: categoriesData }, { data: budgetsData }, { data: transactionsData }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("type", "expense").order("name"),
      supabase.from("budgets").select("*").eq("month", monthDate),
      supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense")
        .gte("date", start)
        .lt("date", end),
    ]);

  const categories = (categoriesData ?? []) as Category[];
  const budgets = (budgetsData ?? []) as Budget[];
  const transactions = (transactionsData ?? []) as Transaction[];

  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (!t.category_id) continue;
    spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount);
  }
  const budgetByCategory = new Map(budgets.map((b) => [b.category_id, b]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted">{monthLabel(competencia)}</p>
        </div>

        <form method="get" className="flex items-end gap-2">
          <input
            name="competencia"
            type="month"
            defaultValue={competencia}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
          >
            Carregar
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          Crie uma categoria de despesa em{" "}
          <Link href="/categorias" className="text-primary hover:underline">
            Categorias
          </Link>{" "}
          para definir orçamentos.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const budget = budgetByCategory.get(category.id);
            return (
              <BudgetCard
                key={category.id}
                category={category}
                month={monthDate}
                budgetId={budget?.id ?? null}
                amount={budget?.amount ?? null}
                spent={spentByCategory.get(category.id) ?? 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
