import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ReceiptText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { TransactionType } from "@/lib/types/database";

export interface RecentTransaction {
  id: string;
  description: string;
  categoryName: string | null;
  categoryColor: string | null;
  type: TransactionType;
  amount: number;
  date: string;
}

function firstLine(text: string) {
  return text.split("\n")[0].trim();
}

export function RecentTransactions({
  items,
  className = "",
}: {
  items: RecentTransaction[];
  className?: string;
}) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader
        icon={ReceiptText}
        title="Transações recentes"
        action={
          <Link
            href="/historico"
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            Ver todas
          </Link>
        }
      />

      {items.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-sm text-muted">
          Nenhuma transação nesta competência.
        </p>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-y border-border bg-background/50 text-left text-xs text-muted">
                <th className="px-5 py-2.5 font-medium">Transação</th>
                <th className="px-3 py-2.5 font-medium">Data</th>
                <th className="px-3 py-2.5 font-medium">Tipo</th>
                <th className="px-5 py-2.5 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const income = t.type === "income";
                const Arrow = income ? ArrowDownLeft : ArrowUpRight;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-5 py-3">
                      <Link href={`/transacao/${t.id}/editar`} className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            income ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          }`}
                        >
                          <Arrow size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[320px] truncate font-medium">
                            {firstLine(t.description) || t.categoryName || "—"}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted">
                            {t.categoryColor && (
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: t.categoryColor }}
                              />
                            )}
                            {t.categoryName ?? "Sem categoria"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted">{formatDate(t.date)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          income ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {income ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${
                        income ? "text-success" : "text-danger"
                      }`}
                    >
                      {income ? "+" : "-"} {formatCurrency(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
