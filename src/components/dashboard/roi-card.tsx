import { Percent } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { formatMultiplier } from "@/lib/format";

export function RoiCard({
  roi,
  adsRoi,
  income,
  expense,
  className = "",
}: {
  roi: number | null;
  adsRoi: number | null;
  income: number;
  expense: number;
  className?: string;
}) {
  const tone = roi === null ? "text-foreground" : roi < 1 ? "text-danger" : "text-success";
  const expenseShare = income > 0 ? Math.min(expense / income, 1) : null;

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader icon={Percent} title="ROI do mês" />

      <p className="text-xs text-muted">Receita ÷ despesas</p>
      <p className={`text-3xl font-semibold tracking-tight ${tone}`}>
        {roi === null ? "—" : formatMultiplier(roi)}
      </p>

      {expenseShare !== null && (
        <div className="mt-4">
          <div className="flex h-2.5 gap-1">
            <div className="rounded-full bg-danger/70" style={{ flexGrow: expenseShare }} />
            {expenseShare < 1 && (
              <div className="rounded-full bg-success" style={{ flexGrow: 1 - expenseShare }} />
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            {expense > income
              ? "Despesas acima da receita"
              : `Despesas usam ${Math.round(expenseShare * 100)}% da receita`}
          </p>
        </div>
      )}

      <p className="mt-auto pt-4 text-xs text-muted">
        {adsRoi === null
          ? "Sem gastos com anúncios no mês"
          : `Só com Anúncios o ROI seria ${formatMultiplier(adsRoi)}`}
      </p>
    </Card>
  );
}
