import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { SavingGoal, SavingDashboard } from "@/types/savings";
import { PiggyBank, Target, TrendingUp, CheckCircle2, CircleDot, CircleDollarSign } from "lucide-react";

interface SavingsDashboardProps {
  dashboard: SavingDashboard;
  currency: string;
  onContribute?: (goal: SavingGoal) => void;
}

export function SavingsDashboardView({ dashboard, currency, onContribute }: SavingsDashboardProps) {
  const { t } = useTranslation();

  const overviewCards = [
    {
      key: "saved",
      label: t("savings.dashboard.totalSaved"),
      value: formatCurrency(dashboard.totalSaved, currency),
      colors: {
        from: "from-emerald-500/10",
        via: "via-green-500/5",
        orb: "from-emerald-400/20",
        iconFrom: "from-emerald-500",
        iconTo: "to-green-600",
        text: "text-emerald-600 dark:text-emerald-400",
        labelColor: "text-emerald-700 dark:text-emerald-300",
        hoverShadow: "hover:shadow-emerald-500/20",
        iconShadow: "shadow-emerald-500/30",
      },
      icon: PiggyBank,
    },
    {
      key: "target",
      label: t("savings.dashboard.totalTarget"),
      value: formatCurrency(dashboard.totalTarget, currency),
      colors: {
        from: "from-blue-500/10",
        via: "via-cyan-500/5",
        orb: "from-blue-400/20",
        iconFrom: "from-blue-500",
        iconTo: "to-cyan-600",
        text: "text-blue-600 dark:text-blue-400",
        labelColor: "text-blue-700 dark:text-blue-300",
        hoverShadow: "hover:shadow-blue-500/20",
        iconShadow: "shadow-blue-500/30",
      },
      icon: Target,
    },
    {
      key: "progress",
      label: t("savings.dashboard.overallProgress"),
      value: `${dashboard.overallProgressPercentage.toFixed(1)}%`,
      colors: {
        from: "from-purple-500/10",
        via: "via-violet-500/5",
        orb: "from-purple-400/20",
        iconFrom: "from-purple-500",
        iconTo: "to-violet-600",
        text: "text-purple-600 dark:text-purple-400",
        labelColor: "text-purple-700 dark:text-purple-300",
        hoverShadow: "hover:shadow-purple-500/20",
        iconShadow: "shadow-purple-500/30",
      },
      icon: TrendingUp,
    },
    {
      key: "counts",
      label: t("savings.dashboard.goalCounts"),
      value: `${dashboard.activeGoalsCount} / ${dashboard.completedGoalsCount}`,
      colors: {
        from: "from-amber-500/10",
        via: "via-orange-500/5",
        orb: "from-amber-400/20",
        iconFrom: "from-amber-500",
        iconTo: "to-orange-600",
        text: "text-amber-600 dark:text-amber-400",
        labelColor: "text-amber-700 dark:text-amber-300",
        hoverShadow: "hover:shadow-amber-500/20",
        iconShadow: "shadow-amber-500/30",
      },
      icon: CheckCircle2,
    },
  ];

  return (
    <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <CardHeader className="border-b bg-card pb-4">
        <CardTitle className="text-foreground">{t("savings.dashboard.title")}</CardTitle>
        <CardDescription>{t("savings.dashboard.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {overviewCards.map((card) => (
            <div
              key={card.key}
              className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${card.colors.from} ${card.colors.via} to-transparent p-5 ${card.colors.hoverShadow} hover:shadow-lg transition-all duration-300`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.colors.orb} to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${card.colors.iconFrom} ${card.colors.iconTo} shadow-lg ${card.colors.iconShadow} flex items-center justify-center mb-3`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`text-xs uppercase tracking-[0.15em] font-medium ${card.colors.labelColor} mb-2`}>{card.label}</div>
                <div className={`text-xl font-bold ${card.colors.text}`}>{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("savings.dashboard.overallProgress")}</span>
            <span className="font-medium">{dashboard.overallProgressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(dashboard.overallProgressPercentage, 100)} className="h-2" />
        </div>

        {/* Goal Quick List */}
        {dashboard.top5Goals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t("savings.dashboard.goalOverview")}</h3>
            <div className="space-y-2">
              {dashboard.top5Goals.map((goal) => (
                <div
                  key={goal.savingGoalId}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: goal.color
                          ? `linear-gradient(135deg, ${goal.color}20, ${goal.color}10)`
                          : "linear-gradient(135deg, #10b98120, #10b98110)",
                        border: `1px solid ${goal.color ? goal.color + "25" : "#10b98125"}`,
                      }}
                    >
                      {goal.icon ? (
                        <span className="text-sm">{goal.icon}</span>
                      ) : (
                        <CircleDot className="h-4 w-4" style={{ color: goal.color || "#10b981" }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{goal.goalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onContribute && goal.status.toUpperCase() === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        onClick={() => onContribute(goal)}
                      >
                        <CircleDollarSign className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="w-20">
                      <Progress value={Math.min(goal.progressPercentage, 100)} className="h-2" />
                    </div>
                    <span className={`text-xs font-semibold min-w-12 text-right ${
                      goal.progressPercentage >= 100
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}>
                      {goal.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
