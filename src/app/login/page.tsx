"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [mode, setMode] = useState<"entrar" | "cadastro">("entrar");
  const action = mode === "entrar" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold">
          <span className="text-primary">LCK</span>
          <span>Digital Group</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex rounded-lg bg-background p-1">
            <button
              type="button"
              onClick={() => setMode("entrar")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "entrar"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("cadastro")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "cadastro"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            {mode === "cadastro" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm text-muted">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-muted">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-muted">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {state.error && (
              <p className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {pending
                ? "Aguarde..."
                : mode === "entrar"
                ? "Entrar"
                : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
