"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  accountName,
  parkSession,
  readAccountsIndex,
  readParkedSession,
  removeParkedAccount,
} from "@/lib/accounts";

export interface AuthState {
  error: string | null;
  info: string | null;
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: null,
        info: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).",
      };
    }
    return { error: "E-mail ou senha inválidos.", info: null };
  }

  if (data.session && data.user) {
    await parkSession({
      id: data.user.id,
      email: data.user.email ?? email,
      name: accountName(data.user),
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres.", info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: "Não foi possível criar a conta. Tente outro e-mail.", info: null };
  }

  if (!data.session || !data.user) {
    return {
      error: null,
      info: "Conta criada! Verifique seu e-mail para confirmar antes de entrar.",
    };
  }

  await parkSession({
    id: data.user.id,
    email: data.user.email ?? email,
    name: accountName(data.user),
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // scope local: encerra só esta sessão, sem derrubar o login em outros aparelhos.
  await supabase.auth.signOut({ scope: "local" });
  if (user) await removeParkedAccount(user.id);

  // "Sair só da conta atual": entra na próxima conta salva, se houver.
  for (const account of await readAccountsIndex()) {
    const parked = await readParkedSession(account.id);
    if (!parked) {
      await removeParkedAccount(account.id);
      continue;
    }
    const { data, error } = await supabase.auth.setSession({
      access_token: parked.a,
      refresh_token: parked.r,
    });
    if (!error && data.session && data.user) {
      await parkSession({
        id: data.user.id,
        email: data.user.email ?? account.email,
        name: accountName(data.user),
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      redirect("/dashboard");
    }
    await removeParkedAccount(account.id);
  }

  redirect("/login");
}
