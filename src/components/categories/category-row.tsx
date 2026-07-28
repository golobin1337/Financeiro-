"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import {
  deleteCategory,
  updateCategory,
  type CategoryFormState,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types/database";

const initialState: CategoryFormState = { error: null };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateCategory, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  if (editing) {
    return (
      <form
        action={formAction}
        className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
      >
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="type" value={category.type} />
        <input
          type="color"
          name="color"
          defaultValue={category.color}
          className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
        />
        <input
          name="name"
          defaultValue={category.name}
          required
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg p-1.5 text-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
        {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span className="flex-1 text-sm">{category.name}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md p-1.5 text-muted opacity-0 transition hover:text-foreground group-hover:opacity-100"
      >
        <Pencil size={14} />
      </button>
      <form action={deleteCategory}>
        <input type="hidden" name="id" value={category.id} />
        <button
          type="submit"
          className="rounded-md p-1.5 text-muted opacity-0 transition hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  );
}
