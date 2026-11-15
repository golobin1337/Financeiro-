"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Plus,
  Repeat,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/historico", label: "Histórico", icon: List },
  { href: "/categorias", label: "Categorias", icon: Tag },
  { href: "/orcamentos", label: "Orçamentos", icon: Wallet },
  { href: "/recorrencias", label: "Recorrências", icon: Repeat },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold whitespace-nowrap">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">
        L
      </span>
      <span>
        <span className="text-primary">LCK</span> Digital Group
      </span>
    </Link>
  );
}

function NewTransactionLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/transacao/nova"
      onClick={onNavigate}
      className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
    >
      <Plus size={16} />
      Transação
    </Link>
  );
}

export function Sidebar({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Telas menores: barra no topo com botão que abre o menu lateral. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 xl:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
        >
          <Menu size={18} />
        </button>
        <Logo />
        <div className="flex-1" />
        <NewTransactionLink />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 xl:hidden" onClick={closeDrawer} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-4 py-5 transition-transform xl:sticky xl:top-0 xl:z-auto xl:h-screen xl:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground xl:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition hover:bg-surface-hover"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {userLabel.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{userLabel}</span>
              <span className="block text-xs text-muted">Minha conta</span>
            </span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {accountOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
              <div className="absolute inset-x-0 z-20 mt-2 rounded-lg border border-border bg-surface p-1 shadow-lg">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-surface-hover"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-xs font-medium tracking-wider text-muted uppercase">
            Menu principal
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-xs font-medium tracking-wider text-muted uppercase">
            Preferências
          </p>
          <div className="flex items-center justify-between rounded-lg pl-3 text-sm font-medium text-muted">
            Tema
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-border bg-background p-4 text-center">
          <p className="text-sm font-semibold">Registrar movimento</p>
          <p className="mt-1 mb-3 text-xs text-muted">Lance as receitas e despesas do dia.</p>
          <NewTransactionLink onNavigate={closeDrawer} />
        </div>
      </aside>
    </>
  );
}
