import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import type { AccountRef } from "@/lib/types/account";

/**
 * Contas salvas = troca rápida sem digitar senha. Cada conta guarda os tokens do
 * Supabase num cookie httpOnly próprio (`fin-sess-<id>`), e um índice (`fin-accounts`)
 * lista as contas para o menu. Os tokens nunca chegam ao JavaScript do navegador.
 */

const INDEX_COOKIE = "fin-accounts";
const sessionCookie = (id: string) => `fin-sess-${id}`;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  };
}

interface ParkedSession {
  a: string; // access_token
  r: string; // refresh_token
}

export function accountName(user: Pick<User, "email" | "user_metadata">): string {
  return (user.user_metadata?.name as string | undefined) ?? user.email?.split("@")[0] ?? "conta";
}

export async function readAccountsIndex(): Promise<AccountRef[]> {
  const raw = (await cookies()).get(INDEX_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is AccountRef =>
        a && typeof a.id === "string" && typeof a.email === "string" && typeof a.name === "string"
    );
  } catch {
    return [];
  }
}

export async function readParkedSession(id: string): Promise<ParkedSession | null> {
  const raw = (await cookies()).get(sessionCookie(id))?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.a === "string" && typeof parsed.r === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

/** Salva/atualiza uma conta e seus tokens, deixando-a no topo da lista (mais recente). */
export async function parkSession(account: {
  id: string;
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
}): Promise<void> {
  const store = await cookies();
  const session: ParkedSession = { a: account.access_token, r: account.refresh_token };
  store.set(sessionCookie(account.id), JSON.stringify(session), cookieOptions());

  const ref: AccountRef = { id: account.id, email: account.email, name: account.name };
  const list = (await readAccountsIndex()).filter((a) => a.id !== account.id);
  store.set(INDEX_COOKIE, JSON.stringify([ref, ...list]), cookieOptions());
}

export async function removeParkedAccount(id: string): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookie(id));
  const list = (await readAccountsIndex()).filter((a) => a.id !== id);
  if (list.length === 0) store.delete(INDEX_COOKIE);
  else store.set(INDEX_COOKIE, JSON.stringify(list), cookieOptions());
}
