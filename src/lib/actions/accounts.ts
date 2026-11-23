"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  accountName,
  parkSession,
  readAccountsIndex,
  readParkedSession,
  removeParkedAccount,
} from "@/lib/accounts";

/** Guarda a sessão ativa atual (tokens mais recentes) antes de trocar para outra conta. */
async function parkCurrent(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: sessionData }, { data: userData }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);
  const session = sessionData.session;
  const user = userData.user;
  if (!session || !user) return null;
  await parkSession({
    id: user.id,
    email: user.email ?? "",
    name: accountName(user),
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  return user.id;
}

export async function switchAccount(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const currentId = await parkCurrent(supabase);
  if (id === currentId) redirect("/dashboard");

  const email = (await readAccountsIndex()).find((a) => a.id === id)?.email ?? "";
  const reauthUrl = `/login?add=1${email ? `&email=${encodeURIComponent(email)}` : ""}`;

  const parked = await readParkedSession(id);
  if (!parked) {
    await removeParkedAccount(id);
    redirect(reauthUrl);
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: parked.a,
    refresh_token: parked.r,
  });

  // Sessão guardada expirou/foi revogada: tira do menu e pede login de novo.
  if (error || !data.session || !data.user) {
    await removeParkedAccount(id);
    redirect(reauthUrl);
  }

  await parkSession({
    id: data.user.id,
    email: data.user.email ?? "",
    name: accountName(data.user),
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function startAddAccount() {
  const supabase = await createClient();
  await parkCurrent(supabase);
  redirect("/login?add=1");
}
