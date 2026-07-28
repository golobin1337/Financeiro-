"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  createCategory,
  type CategoryFormState,
} from "@/lib/actions/categories";
import type { TransactionType } from "@/lib/types/database";

const initialState: CategoryFormState = { error: null };

export function NewCategoryForm({ defaultType }: { defaultType: TransactionType }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
      >
        <Plus size={14} />
        Nova categoria
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2"
    >
      <input type="hidden" name="type" value={defaultType} />
      <input
        type="color"
        name="color"
        defaultValue="#8b5cf6"
        className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
      />
      <input
        name="name"
        placeholder="Nome da categoria"
        required
        autoFocus
        className="flex-1 min-w-[140px] rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
      >
        Cancelar
      </button>
      {state.error && (
        <p className="w-full text-sm text-danger">{state.error}</p>
      )}
    </form>
  );
}
