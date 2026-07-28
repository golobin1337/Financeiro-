import { createClient } from "@/lib/supabase/server";
import { CategoryRow } from "@/components/categories/category-row";
import { NewCategoryForm } from "@/components/categories/new-category-form";
import type { Category } from "@/lib/types/database";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categories = (data ?? []) as Category[];
  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted">Organize suas receitas e despesas</p>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          Não foi possível carregar as categorias.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-success">Receitas</h2>
          <div className="flex flex-col gap-2">
            {income.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
            {income.length === 0 && (
              <p className="text-sm text-muted">Nenhuma categoria de receita.</p>
            )}
          </div>
          <NewCategoryForm defaultType="income" />
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-danger">Despesas</h2>
          <div className="flex flex-col gap-2">
            {expense.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
            {expense.length === 0 && (
              <p className="text-sm text-muted">Nenhuma categoria de despesa.</p>
            )}
          </div>
          <NewCategoryForm defaultType="expense" />
        </section>
      </div>
    </div>
  );
}
