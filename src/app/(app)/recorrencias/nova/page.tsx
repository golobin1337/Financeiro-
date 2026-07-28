import { createClient } from "@/lib/supabase/server";
import { createRecurring } from "@/lib/actions/recurring";
import { RecurringForm } from "@/components/recurring/recurring-form";
import type { Category } from "@/lib/types/database";

export default async function NovaRecorrenciaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nova recorrência</h1>
        <p className="text-muted">Assinaturas, contas fixas ou receitas recorrentes</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-6">
        <RecurringForm action={createRecurring} categories={(data ?? []) as Category[]} />
      </div>
    </div>
  );
}
