import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function BalanceHeroCard({
  saldo,
  competenciaLabel,
  className = "",
}: {
  saldo: number;
  competenciaLabel: string;
  className?: string;
}) {
  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded-2xl bg-linear-to-br from-[#9a8dff] via-primary to-[#4f41cf] p-5 text-white shadow-[0_10px_30px_-12px_rgba(124,110,242,0.7)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 h-52 w-52 rounded-full bg-white/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-24 h-48 w-48 rounded-full border-[22px] border-white/10"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-white/80">Saldo do mês</p>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
            {competenciaLabel}
          </span>
        </div>

        <p className="mt-3 text-4xl font-bold tracking-tight">{formatCurrency(saldo)}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link
            href="/transacao/nova"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3f31b8] transition hover:bg-white/90"
          >
            <Plus size={14} />
            Nova transação
          </Link>
          <Link
            href="/historico"
            className="flex items-center gap-1.5 rounded-full bg-black/25 px-4 py-2 text-sm font-semibold transition hover:bg-black/35"
          >
            Histórico
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
