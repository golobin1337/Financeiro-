"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category } from "@/lib/types/database";

export function HistoricoFilters({
  categories,
  type,
  categoryId,
  search,
}: {
  categories: Category[];
  type: string;
  categoryId: string;
  search: string;
}) {
  const [selectedType, setSelectedType] = useState(type);

  const filteredCategories = useMemo(
    () => categories.filter((c) => !selectedType || c.type === selectedType),
    [categories, selectedType]
  );

  return (
    <form
      method="get"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-4"
    >
      <input
        name="q"
        defaultValue={search}
        placeholder="Buscar por descrição..."
        className="min-w-[180px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <select
        name="type"
        defaultValue={type}
        onChange={(e) => setSelectedType(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Todos os tipos</option>
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>
      <select
        name="category_id"
        defaultValue={categoryId}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Todas as categorias</option>
        {filteredCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Filtrar
      </button>
      {(type || categoryId || search) && (
        <Link href="/historico" className="text-sm text-muted hover:text-foreground">
          Limpar filtros
        </Link>
      )}
    </form>
  );
}
