import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteRecurring, toggleRecurringActive } from "@/lib/actions/recurring";
import { formatCurrency, formatDate } from "@/lib/format";
import type { RecurringTransactionWithCategory } from "@/lib/types/database";

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export default async function RecorrenciasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*, category:categories(*)")
    .order("next_date", { ascending: true });

  const recurring = (data ?? []) as RecurringTransactionWithCategory[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recorrências</h1>
          <p className="text-muted">Assinaturas, contas fixas e receitas recorrentes</p>
        </div>
        <Link
          href="/recorrencias/nova"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Nova recorrência
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          Não foi possível carregar as recorrências.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {recurring.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 ${
              r.active ? "" : "opacity-50"
            }`}
          >
            {r.category && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: r.category.color }}
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{r.description || r.category?.name || "Recorrência"}</p>
              <p className="text-sm text-muted">
                {FREQUENCY_LABEL[r.frequency]} · próxima em {formatDate(r.next_date)}
              </p>
            </div>
            <span
              className={`font-medium ${r.type === "income" ? "text-success" : "text-danger"}`}
            >
              {r.type === "income" ? "+" : "-"} {formatCurrency(r.amount)}
            </span>

            <form action={toggleRecurringActive}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="active" value={String(r.active)} />
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
              >
                {r.active ? "Pausar" : "Ativar"}
              </button>
            </form>

            <Link
              href={`/recorrencias/${r.id}/editar`}
              className="rounded-md p-1.5 text-muted hover:text-foreground"
            >
              <Pencil size={14} />
            </Link>
            <form action={deleteRecurring}>
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="rounded-md p-1.5 text-muted hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        ))}

        {recurring.length === 0 && !error && (
          <p className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
            Nenhuma recorrência cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}
