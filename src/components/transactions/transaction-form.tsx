"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TransactionFormState } from "@/lib/actions/transactions";
import type { Category, Transaction, TransactionType } from "@/lib/types/database";

const initialState: TransactionFormState = { error: null };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  action,
  categories,
  transaction,
}: {
  action: (
    state: TransactionFormState,
    formData: FormData
  ) => Promise<TransactionFormState>;
  categories: Category[];
  transaction?: Transaction;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <div className="flex rounded-lg bg-background p-1">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            type === "expense" ? "bg-danger text-white" : "text-muted hover:text-foreground"
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            type === "income" ? "bg-success text-black" : "text-muted hover:text-foreground"
          }`}
        >
          Receita
        </button>
      </div>
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm text-muted">
          Valor (R$)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={transaction?.amount}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category_id" className="text-sm text-muted">
          Categoria
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={transaction?.category_id ?? ""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Sem categoria</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm text-muted">
          Descrição
        </label>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={200}
          defaultValue={transaction?.description}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="text-sm text-muted">
          Data
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={transaction?.date ?? todayISO()}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
