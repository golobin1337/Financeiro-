"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { RecurringFrequency } from "@/lib/types/database";

const recurringSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable(),
  description: z.string().trim().max(200).default(""),
  frequency: z.enum(["weekly", "monthly", "yearly"]),
  start_date: z.string().min(1, "Informe a data de início."),
});

export interface RecurringFormState {
  error: string | null;
}

function parseRecurring(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "");
  return recurringSchema.safeParse({
    amount: formData.get("amount"),
    type: formData.get("type"),
    category_id: categoryId ? categoryId : null,
    description: formData.get("description") ?? "",
    frequency: formData.get("frequency"),
    start_date: formData.get("start_date"),
  });
}

export async function createRecurring(
  _prevState: RecurringFormState,
  formData: FormData
): Promise<RecurringFormState> {
  const parsed = parseRecurring(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase.from("recurring_transactions").insert({
    user_id: user.id,
    ...parsed.data,
    next_date: parsed.data.start_date,
    active: true,
  });

  if (error) return { error: "Não foi possível criar a recorrência." };

  revalidatePath("/recorrencias");
  redirect("/recorrencias");
}

export async function updateRecurring(
  _prevState: RecurringFormState,
  formData: FormData
): Promise<RecurringFormState> {
  const id = String(formData.get("id") ?? "");
  const parsed = parseRecurring(formData);
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Recorrência inválida." : parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_transactions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a recorrência." };

  revalidatePath("/recorrencias");
  redirect("/recorrencias");
}

export async function deleteRecurring(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("recurring_transactions").delete().eq("id", id);

  revalidatePath("/recorrencias");
}

export async function toggleRecurringActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("recurring_transactions").update({ active: !active }).eq("id", id);

  revalidatePath("/recorrencias");
}

function advance(date: string, frequency: RecurringFrequency): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (frequency === "weekly") d.setUTCDate(d.getUTCDate() + 7);
  else if (frequency === "monthly") d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

const MAX_CATCHUP_ITERATIONS = 36;

export async function materializeDueRecurring() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().slice(0, 10);

  const { data: due } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .lte("next_date", today);

  if (!due || due.length === 0) return;

  for (const recurring of due) {
    const newTransactions: { user_id: string; category_id: string | null; amount: number; type: string; description: string; date: string }[] = [];
    let cursor = recurring.next_date as string;
    let iterations = 0;

    while (cursor <= today && iterations < MAX_CATCHUP_ITERATIONS) {
      newTransactions.push({
        user_id: user.id,
        category_id: recurring.category_id,
        amount: recurring.amount,
        type: recurring.type,
        description: recurring.description,
        date: cursor,
      });
      cursor = advance(cursor, recurring.frequency as RecurringFrequency);
      iterations++;
    }

    if (newTransactions.length > 0) {
      await supabase.from("transactions").insert(newTransactions);
      await supabase
        .from("recurring_transactions")
        .update({ next_date: cursor })
        .eq("id", recurring.id);
    }
  }
}
