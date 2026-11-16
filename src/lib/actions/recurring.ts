"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { RecurringTransaction } from "@/lib/types/database";
import { todayInBrazil } from "@/lib/dates";
import {
  advanceRecurringDate,
  postRecurringOccurrence,
  recurringAnchorDay,
} from "@/lib/recurring/materialize";

const recurringSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable(),
  description: z
    .string()
    .trim()
    .max(400, "A descrição pode ter no máximo 400 caracteres.")
    .default(""),
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
    // O navegador envia quebras de linha como \r\n, mas o maxLength do campo as conta como 1 caractere.
    description: String(formData.get("description") ?? "").replace(/\r\n/g, "\n"),
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

/** Marca a próxima ocorrência como paga hoje e avança a recorrência para a data seguinte. */
export async function markRecurringPaid(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase.from("recurring_transactions").select("*").eq("id", id).single();
  const recurring = data as RecurringTransaction | null;
  if (!recurring) return;

  if (!(await postRecurringOccurrence(supabase, recurring, todayInBrazil()))) return;

  await supabase
    .from("recurring_transactions")
    .update({
      next_date: advanceRecurringDate(
        recurring.next_date,
        recurring.frequency,
        recurringAnchorDay(recurring)
      ),
    })
    .eq("id", id);

  revalidatePath("/dashboard");
  revalidatePath("/recorrencias");
  revalidatePath("/historico");
}
