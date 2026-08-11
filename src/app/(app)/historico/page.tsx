import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteTransaction } from "@/lib/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { HistoricoFilters } from "@/components/historico/historico-filters";
import type { Category, TransactionWithCategory } from "@/lib/types/database";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const type = params.type ?? "";
  const categoryId = params.category_id ?? "";
  const search = params.q ?? "";

  const supabase = await createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const categories = (categoriesData ?? []) as Category[];

  let query = supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data, error } = await query;
  const transactions = (data ?? []) as TransactionWithCategory[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-muted">Todas as suas transações</p>
      </div>

      <HistoricoFilters
        categories={categories}
        type={type}
        categoryId={categoryId}
        search={search}
      />

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          Não foi possível carregar o histórico.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="group border-b border-border last:border-0 hover:bg-surface-hover"
              >
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {formatDate(t.date)}
                </td>
                <td className="px-4 py-3">{t.description || "—"}</td>
                <td className="px-4 py-3">
                  {t.category ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.category.color }}
                      />
                      {t.category.name}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                    t.type === "income" ? "text-success" : "text-danger"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                    <Link
                      href={`/transacao/${t.id}/editar`}
                      className="rounded-md p-1.5 text-muted hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </Link>
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button
                        type="submit"
                        className="rounded-md p-1.5 text-muted hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
