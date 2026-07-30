import { Bell, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export interface RecurringReminder {
  id: string;
  description: string;
  categoryName: string | null;
  categoryColor: string | null;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "pendente" | "pago";
}

export function RecurringReminders({ items }: { items: RecurringReminder[] }) {
  if (items.length === 0) return null;

  const pendingCount = items.filter((i) => i.status === "pendente").length;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.35)] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Bell size={16} className="text-primary" />
        Recorrências deste mês
        {pendingCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </h2>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
          >
            {item.categoryColor && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.categoryColor }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm">
                {item.description || item.categoryName || "Recorrência"}
              </p>
              <p className="text-xs text-muted">
                {item.status === "pendente" ? "Vence em" : "Cobrado em"} {formatDate(item.date)}
              </p>
            </div>
            <span
              className={`font-medium text-sm ${
                item.type === "income" ? "text-success" : "text-danger"
              }`}
            >
              {item.type === "income" ? "+" : "-"} {formatCurrency(item.amount)}
            </span>
            {item.status === "pendente" ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Pendente
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                <Check size={12} />
                Pago
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
