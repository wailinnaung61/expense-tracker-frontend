import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { SavingDashboard } from "@/types/savings";
import { Link } from "react-router-dom";
import { PiggyBank, ArrowRight, CircleDot } from "lucide-react";

interface SavingsSnapshotProps {
  savings: SavingDashboard;
  currency: string;
}

export function SavingsSnapshot({ savings, currency }: SavingsSnapshotProps) {
  const { t } = useTranslation();
  const pct = Math.min(savings.overallProgressPercentage, 100);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.savings")}</CardTitle>
          <Link
            to="/saving"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(savings.totalSaved, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.of")} {formatCurrency(savings.totalTarget, currency)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-lg font-bold">{pct.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {savings.activeGoalsCount} {t("dashboard.activeGoals")}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Top goals (max 3) */}
        {savings.top5Goals.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            {savings.top5Goals.slice(0, 3).map((goal) => {
              const goalPct = Math.min(goal.progressPercentage, 100);
              return (
                <div key={goal.savingGoalId} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: goal.color
                        ? `linear-gradient(135deg, ${goal.color}20, ${goal.color}10)`
                        : undefined,
                      border: `1px solid ${goal.color ? goal.color + "25" : "#10b98125"}`,
                    }}
                  >
                    {goal.icon ? (
                      <span className="text-xs">{goal.icon}</span>
                    ) : (
                      <CircleDot className="h-3.5 w-3.5" style={{ color: goal.color || "#10b981" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{goal.goalName}</p>
                    <div className="h-1.5 w-full rounded-full bg-muted/80 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${goalPct}%`,
                          background: goal.color || "#3b82f6",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                    {goalPct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
