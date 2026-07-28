import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
  icon: LucideIcon;
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";
  const badgeClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "danger"
      ? "bg-danger/10 text-danger"
      : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${badgeClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
    </div>
  );
}
