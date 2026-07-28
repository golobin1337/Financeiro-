"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBudget, upsertBudget, type BudgetFormState } from "@/lib/actions/budgets";
import { formatCurrency } from "@/lib/format";
import type { Category } from "@/lib/types/database";

const initialState: BudgetFormState = { error: null };

export function BudgetCard({
  category,
  month,
  budgetId,
  amount,
  spent,
}: {
  category: Category;
  month: string;
  budgetId: string | null;
  amount: number | null;
  spent: number;
}) {
  const [editing, setEditing] = useState(amount === null);
  const [state, formAction, pending] = useActionState(upsertBudget, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  const percent = amount ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
  const over = amount !== null && spent > amount;
  const barColor = over ? "var(--danger)" : percent >= 80 ? "#eda100" : "var(--primary)";

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 font-medium">{category.name}</span>
        {!editing && amount !== null && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md p-1.5 text-muted hover:text-foreground"
            >
              <Pencil size={14} />
            </button>
            <form action={deleteBudget}>
              <input type="hidden" name="id" value={budgetId ?? ""} />
              <button type="submit" className="rounded-md p-1.5 text-muted hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </>
        )}
      </div>

      {editing ? (
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="category_id" value={category.id} />
          <input type="hidden" name="month" value={month} />
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            autoFocus
            defaultValue={amount ?? undefined}
            placeholder="Valor do orçamento"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "..." : "Salvar"}
          </button>
          {amount !== null && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              Cancelar
            </button>
          )}
          {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
        </form>
      ) : (
        <>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-sm text-muted">
            {formatCurrency(spent)} de {formatCurrency(amount ?? 0)}
            {over && <span className="ml-1 text-danger">· acima do orçamento</span>}
          </p>
        </>
      )}
    </div>
  );
}
