-- LCK Digital Group: liga transações geradas automaticamente à recorrência de origem
-- Rode este arquivo no SQL Editor do seu projeto Supabase (depois do 0001_init.sql).

alter table public.transactions
  add column if not exists recurring_id uuid references public.recurring_transactions(id) on delete set null;

create index if not exists transactions_recurring_id_idx on public.transactions (recurring_id);
