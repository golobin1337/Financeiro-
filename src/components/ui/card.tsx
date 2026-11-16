import type { LucideIcon } from "lucide-react";

export const CARD_SURFACE_CLASS =
  "rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)]";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // min-w-0: dentro do grid, conteúdo largo (como tabelas) rola dentro do card em vez de alargar a página.
  return <section className={`${CARD_SURFACE_CLASS} min-w-0 p-5 ${className}`}>{children}</section>;
}

export function CardHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} className="text-primary" />
        {title}
      </h2>
      {action}
    </div>
  );
}

export function CardPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 text-xs whitespace-nowrap text-muted">
      {children}
    </span>
  );
}
