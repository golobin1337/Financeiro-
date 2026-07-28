"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: null,
        info: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).",
      };
    }
    return { error: "E-mail ou senha inválidos.", info: null };
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

  if (!data.session) {
    return {
      error: null,
      info: "Conta criada! Verifique seu e-mail para confirmar antes de entrar.",
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
