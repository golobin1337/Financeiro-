"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const budgetSchema = z.object({
  category_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
});

export interface BudgetFormState {
  error: string | null;
}

export async function upsertBudget(
  _prevState: BudgetFormState,
  formData: FormData
): Promise<BudgetFormState> {
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    month: formData.get("month"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id,category_id,month" }
    );

  if (error) return { error: "Não foi possível salvar o orçamento." };

  revalidatePath("/orcamentos");
  return { error: null };
}

export async function deleteBudget(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("budgets").delete().eq("id", id);

  revalidatePath("/orcamentos");
}
