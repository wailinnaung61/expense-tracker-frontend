import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { BudgetMonthlyResponse } from "@/types/budget";
import { Link } from "react-router-dom";
import { Target, AlertTriangle, ArrowRight } from "lucide-react";

interface BudgetSnapshotProps {
  budget: BudgetMonthlyResponse | null;
  currency: string;
}

export function BudgetSnapshot({ budget, currency }: BudgetSnapshotProps) {
  const { t } = useTranslation();

  if (!budget) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("dashboard.budget")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm mb-3">{t("dashboard.noBudget")}</p>
            <Link
              to="/budget"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              {t("dashboard.createBudget")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, categories } = budget;
  const usageColor =
    summary.usagePercent >= 100
      ? "text-red-600 dark:text-red-400"
      : summary.usagePercent >= 85
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  // Top 4 categories by spent
  const topCats = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.budget")}</CardTitle>
          <Link
            to="/budget"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall usage */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {t("dashboard.budgetUsed")}
            </span>
            <span className={`text-lg font-bold ${usageColor}`}>
              {summary.usagePercent}%
            </span>
          </div>
          <Progress
            value={Math.min(summary.usagePercent, 100)}
            className="h-2.5"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(summary.totalSpent, currency)} {t("dashboard.spent")}</span>
            <span>{formatCurrency(summary.remaining, currency)} {t("dashboard.remaining")}</span>
          </div>
        </div>

        {/* Top categories */}
        {topCats.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t">
            {topCats.map((cat) => {
              const isOver = cat.status === "OVER";
              return (
                <div key={cat.budgetCategoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                      {isOver && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(cat.spent, currency)} / {formatCurrency(cat.allocated, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(cat.usagePercent, 100)}%`,
                        background: isOver
                          ? "#ef4444"
                          : cat.usagePercent >= 80
                            ? "#f59e0b"
                            : cat.color || "#10b981",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
