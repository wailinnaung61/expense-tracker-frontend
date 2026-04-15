import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { BudgetSummaryDto, TopSpendingDto } from "@/types/budget";
import { Target, TrendingUp, Wallet, WalletCards } from "lucide-react";

interface BudgetSummaryProps {
  summary: BudgetSummaryDto;
  topSpending: TopSpendingDto[];
  periodLabel: string;
  currency: string;
  profileDailyLimit: number;
}

export function BudgetSummary({
  summary,
  topSpending,
  periodLabel,
  currency,
  profileDailyLimit,
}: BudgetSummaryProps) {
  const { t } = useTranslation();
  const safeDailyCap =
    profileDailyLimit > 0
      ? Math.min(profileDailyLimit, Math.max(summary.dailyBudget, 0))
      : Math.max(summary.dailyBudget, 0);

  const usageTone =
    summary.usagePercent >= 100
      ? "bg-red-600"
      : summary.usagePercent >= 85
      ? "bg-amber-500"
      : "bg-emerald-500";

  const paceMessage =
    summary.remaining < 0
      ? t("budget.summary.paceOver")
      : summary.usagePercent >= 85
      ? t("budget.summary.paceWarning")
      : t("budget.summary.paceHealthy");

  const overviewCards = [
    {
      key: "budget",
      label: t("budget.summary.totalBudget"),
      value: formatCurrency(summary.totalBudget, currency),
      tone: "border-emerald-200 dark:border-emerald-800 bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-300",
      iconBg: "bg-emerald-500",
      icon: WalletCards,
    },
    {
      key: "spent",
      label: t("budget.summary.totalSpent"),
      value: formatCurrency(summary.totalSpent, currency),
      tone: "border-red-200 dark:border-red-800 bg-linear-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900 text-red-700 dark:text-red-300",
      iconBg: "bg-red-500",
      icon: Wallet,
    },
    {
      key: "remaining",
      label: t("budget.summary.remaining"),
      value: formatCurrency(summary.remaining, currency),
      tone: "border-blue-200 dark:border-blue-800 bg-linear-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 text-blue-700 dark:text-blue-300",
      iconBg: "bg-blue-500",
      icon: Target,
    },
    {
      key: "usage",
      label: t("budget.summary.budgetUsed"),
      value: `${summary.usagePercent}%`,
      tone: "border-violet-200 dark:border-violet-800 bg-linear-to-br from-violet-50 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-900 text-violet-700 dark:text-violet-300",
      iconBg: "bg-violet-500",
      icon: TrendingUp,
    },
  ];

  return (
    <Card className="sticky top-12 overflow-hidden rounded-3xl border bg-card shadow-sm">
      <CardHeader className="border-b bg-card pb-4">
        <CardTitle className="text-foreground">{t("budget.summary.title")}</CardTitle>
        <CardDescription>
          {t("budget.summary.description", { period: periodLabel } as any)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {overviewCards.map((card) => {
            const colorMap: Record<string, { from: string; via: string; orb: string; iconFrom: string; iconTo: string; text: string }> = {
              'budget': { from: 'from-emerald-500/10', via: 'via-green-500/5', orb: 'from-emerald-400/20', iconFrom: 'from-emerald-500', iconTo: 'to-green-600', text: 'text-emerald-600 dark:text-emerald-400' },
              'spent': { from: 'from-rose-500/10', via: 'via-red-500/5', orb: 'from-rose-400/20', iconFrom: 'from-rose-500', iconTo: 'to-red-600', text: 'text-rose-600 dark:text-rose-400' },
              'remaining': { from: 'from-blue-500/10', via: 'via-cyan-500/5', orb: 'from-blue-400/20', iconFrom: 'from-blue-500', iconTo: 'to-cyan-600', text: 'text-blue-600 dark:text-blue-400' },
              'usage': { from: 'from-purple-500/10', via: 'via-violet-500/5', orb: 'from-purple-400/20', iconFrom: 'from-purple-500', iconTo: 'to-violet-600', text: 'text-purple-600 dark:text-purple-400' },
            };
            const colors = colorMap[card.key];
            return (
              <div
                key={card.key}
                className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${colors.from} ${colors.via} to-transparent dark:${colors.from.replace('/10', '/20')} dark:${colors.via.replace('/5', '/10')} p-5 hover:shadow-lg hover:shadow-${card.key === 'budget' ? 'emerald' : card.key === 'spent' ? 'rose' : card.key === 'remaining' ? 'blue' : 'purple'}-500/20 transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors.orb} to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${colors.iconFrom} ${colors.iconTo} shadow-lg shadow-${card.key === 'budget' ? 'emerald' : card.key === 'spent' ? 'rose' : card.key === 'remaining' ? 'blue' : 'purple'}-500/30 flex items-center justify-center mb-3`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`text-xs uppercase tracking-[0.15em] font-medium ${card.key === 'budget' ? 'text-emerald-700 dark:text-emerald-300' : card.key === 'spent' ? 'text-rose-700 dark:text-rose-300' : card.key === 'remaining' ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'} mb-2`}>{card.label}</div>
                  <div className={`text-xl font-bold ${colors.text}`}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-2xl border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>{t("budget.summary.budgetUsed")}</span>
            <span className="font-medium">{summary.usagePercent}%</span>
          </div>
          <Progress
            value={Math.min(summary.usagePercent, 100)}
            className="h-2"
            indicatorClassName={usageTone}
          />
          <p className="text-xs text-muted-foreground">{paceMessage}</p>
        </div>

        <div className="rounded-3xl border border-blue-300 dark:border-blue-800 bg-linear-to-br from-blue-100 via-blue-50 to-cyan-100 dark:from-blue-950 dark:via-blue-900 dark:to-cyan-900 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-100">
                  {t("budget.summary.dailyBudget")}
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {formatCurrency(summary.dailyBudget, currency)}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-300 dark:border-blue-700 bg-white/90 dark:bg-blue-950/50 px-3 py-2 text-right shadow-xs backdrop-blur-sm">
              <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-200">
                <Wallet className="h-3 w-3" />
                {t("budget.summary.dailyLimit")}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {profileDailyLimit > 0
                  ? formatCurrency(profileDailyLimit, currency)
                  : t("budget.summary.notSet")}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-blue-300 dark:border-blue-700 bg-white/90 dark:bg-blue-950/50 p-4 shadow-xs backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Target className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              {t("budget.summary.recommendedCap")}
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {formatCurrency(safeDailyCap, currency)}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200">
              {profileDailyLimit > 0
                ? t("budget.summary.dailyGuidanceWithLimit")
                : t("budget.summary.dailyGuidanceWithoutLimit")}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {t("budget.summary.topSpending")}
          </div>

          {topSpending.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
              {t("budget.summary.noTopSpending")}
            </div>
          ) : (
            topSpending.map((item) => (
              <div key={item.name} className="space-y-2 rounded-xl bg-card p-3 shadow-xs">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.percent}%</span>
                </div>
                <Progress value={Math.min(item.percent, 100)} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
