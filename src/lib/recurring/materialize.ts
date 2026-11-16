import type { createClient } from "@/lib/supabase/server";
import type { RecurringFrequency, RecurringTransaction } from "@/lib/types/database";
import { todayInBrazil } from "@/lib/dates";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_CATCHUP_ITERATIONS = 36;

/**
 * Próxima data da recorrência. Em mensal/anual, `anchorDay` é o dia original (da data de início):
 * num mês mais curto usa o último dia (31/01 → 28/02) e depois volta ao dia original (→ 31/03).
 */
export function advanceRecurringDate(
  date: string,
  frequency: RecurringFrequency,
  anchorDay?: number
): string {
  const [year, month, day] = date.split("-").map(Number);
  if (frequency === "weekly") {
    const d = new Date(Date.UTC(year, month - 1, day + 7));
    return d.toISOString().slice(0, 10);
  }
  const targetYear = frequency === "yearly" ? year + 1 : month === 12 ? year + 1 : year;
  const targetMonth = frequency === "yearly" ? month : month === 12 ? 1 : month + 1;
  const daysInTarget = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(anchorDay ?? day, daysInTarget);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
}

/** Dia original da recorrência, para não "escorregar" depois de um mês curto. */
export function recurringAnchorDay(recurring: Pick<RecurringTransaction, "start_date">): number {
  return Number(recurring.start_date.slice(8, 10));
}

function monthBounds(date: string) {
  const [year, month] = date.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  return { start: `${year}-${pad(month)}-01`, end: `${next}-01` };
}

/**
 * Registra uma ocorrência da recorrência na data informada. Retorna false se não conseguiu.
 *
 * Para não duplicar: se essa ocorrência já foi lançada, não faz nada; e se no mesmo mês já
 * existe uma transação igual lançada à mão (mesma categoria, tipo e valor, sem vínculo),
 * apenas liga essa transação à recorrência em vez de criar outra.
 */
export async function postRecurringOccurrence(
  supabase: SupabaseServerClient,
  recurring: RecurringTransaction,
  date: string
): Promise<boolean> {
  const { data: alreadyPosted, error: postedError } = await supabase
    .from("transactions")
    .select("id")
    .eq("recurring_id", recurring.id)
    .eq("date", date)
    .limit(1);
  if (postedError) return false;
  if (alreadyPosted?.length) return true;

  const { start, end } = monthBounds(date);
  let manualQuery = supabase
    .from("transactions")
    .select("id")
    .is("recurring_id", null)
    .eq("type", recurring.type)
    .eq("amount", recurring.amount)
    .gte("date", start)
    .lt("date", end)
    .limit(1);
  manualQuery = recurring.category_id
    ? manualQuery.eq("category_id", recurring.category_id)
    : manualQuery.is("category_id", null);
  const { data: manual, error: manualError } = await manualQuery;
  if (manualError) return false;

  if (manual?.length) {
    const { error } = await supabase
      .from("transactions")
      .update({ recurring_id: recurring.id })
      .eq("id", manual[0].id);
    return !error;
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: recurring.user_id,
    category_id: recurring.category_id,
    recurring_id: recurring.id,
    amount: recurring.amount,
    type: recurring.type,
    description: recurring.description,
    date,
  });
  return !error;
}

/**
 * Lança as ocorrências vencidas das recorrências ativas e avança a próxima data.
 * Recebe o cliente já criado: dentro de `after()` em layouts não é permitido ler cookies.
 */
export async function materializeDueRecurring(supabase: SupabaseServerClient, userId: string) {
  const today = todayInBrazil();

  const { data: due } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .lte("next_date", today);

  for (const recurring of (due ?? []) as RecurringTransaction[]) {
    let cursor = recurring.next_date;
    let iterations = 0;

    while (cursor <= today && iterations < MAX_CATCHUP_ITERATIONS) {
      // Se falhar, para aqui: a próxima data fica na ocorrência pendente e tenta de novo depois.
      if (!(await postRecurringOccurrence(supabase, recurring, cursor))) break;
      cursor = advanceRecurringDate(cursor, recurring.frequency, recurringAnchorDay(recurring));
      iterations++;
    }

    if (cursor !== recurring.next_date) {
      await supabase
        .from("recurring_transactions")
        .update({ next_date: cursor })
        .eq("id", recurring.id);
    }
  }
}
