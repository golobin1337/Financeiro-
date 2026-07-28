"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  List,
  Tag,
  Wallet,
  Repeat,
  Plus,
  ChevronDown,
  LogOut,
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

export function Navbar({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold whitespace-nowrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">
            L
          </span>
          <span className="hidden sm:inline">
            <span className="text-primary">LCK</span> Digital Group
          </span>
        </Link>

        <div className="flex flex-1 items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/transacao/nova"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Plus size={16} />
          Transação
        </Link>

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-muted hover:text-foreground"
          >
            {userLabel}
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg">
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
      </nav>
    </header>
  );
}
