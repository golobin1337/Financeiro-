import { createClient } from "@/lib/supabase/server";
import { createTransaction } from "@/lib/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { Category } from "@/lib/types/database";

export default async function NovaTransacaoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nova transação</h1>
        <p className="text-muted">Registre uma receita ou despesa</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <TransactionForm
          action={createTransaction}
          categories={(data ?? []) as Category[]}
        />
      </div>
    </div>
  );
}
