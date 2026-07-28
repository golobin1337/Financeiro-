import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRecurring } from "@/lib/actions/recurring";
import { RecurringForm } from "@/components/recurring/recurring-form";
import type { Category, RecurringTransaction } from "@/lib/types/database";

export default async function EditarRecorrenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: recurring }, { data: categories }] = await Promise.all([
    supabase.from("recurring_transactions").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!recurring) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Editar recorrência</h1>
        <p className="text-muted">Atualize os dados da recorrência</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-6">
        <RecurringForm
          action={updateRecurring}
          categories={(categories ?? []) as Category[]}
          recurring={recurring as RecurringTransaction}
        />
      </div>
    </div>
  );
}
