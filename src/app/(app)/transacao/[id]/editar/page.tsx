import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTransaction } from "@/lib/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { Category, Transaction } from "@/lib/types/database";

export default async function EditarTransacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: transaction }, { data: categories }] = await Promise.all([
    supabase.from("transactions").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!transaction) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Editar transação</h1>
        <p className="text-muted">Atualize os dados do lançamento</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-6">
        <TransactionForm
          action={updateTransaction}
          categories={(categories ?? []) as Category[]}
          transaction={transaction as Transaction}
        />
      </div>
    </div>
  );
}
