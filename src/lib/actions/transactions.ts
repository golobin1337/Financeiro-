"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable(),
  description: z.string().trim().max(200).default(""),
  date: z.string().min(1, "Informe a data."),
});

export interface TransactionFormState {
  error: string | null;
}

function parseTransaction(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "");
  return transactionSchema.safeParse({
    amount: formData.get("amount"),
    type: formData.get("type"),
    category_id: categoryId ? categoryId : null,
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  });
}

export async function createTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const parsed = parseTransaction(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) return { error: "Não foi possível salvar a transação." };

  revalidatePath("/historico");
  revalidatePath("/dashboard");
  redirect("/historico");
}

export async function updateTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const id = String(formData.get("id") ?? "");
  const parsed = parseTransaction(formData);
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Transação inválida." : parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a transação." };

  revalidatePath("/historico");
  revalidatePath("/dashboard");
  redirect("/historico");
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);

  revalidatePath("/historico");
  revalidatePath("/dashboard");
}
