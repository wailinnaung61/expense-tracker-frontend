import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyAggregation } from "@/types/aggregation";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
} from "lucide-react";

interface SummaryCardsProps {
  current: MonthlyAggregation | null;
  previous: MonthlyAggregation | null;
  currency: string;
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return ((curr - prev) / prev) * 100;
}

export const SummaryCards = memo(function SummaryCards({ current, previous, currency }: SummaryCardsProps) {
  const { t } = useTranslation();

  const incomeVal = current?.income ?? 0;
  const expenseVal = current?.expense ?? 0;
  const savingVal = current?.saving ?? 0;
  const investmentVal = current?.investment ?? 0;
  const netBalance = incomeVal - expenseVal - savingVal - investmentVal;

  const prevIncomeVal = previous?.income ?? 0;
  const prevExpenseVal = previous?.expense ?? 0;
  const prevSavingVal = previous?.saving ?? 0;
  const prevInvestmentVal = previous?.investment ?? 0;
  const prevNetBalance = prevIncomeVal - prevExpenseVal - prevSavingVal - prevInvestmentVal;

  const cards = useMemo(() => [
    {
      key: "income",
      label: t("dashboard.income"),
      value: current?.income ?? 0,
      prev: previous?.income ?? 0,
      icon: Wallet,
      colors: {
        from: "from-emerald-500/10",
        via: "via-green-500/5",
        orb: "from-emerald-400/20",
        iconFrom: "from-emerald-500",
        iconTo: "to-green-600",
        text: "text-emerald-600 dark:text-emerald-400",
        labelColor: "text-emerald-700 dark:text-emerald-300",
        iconShadow: "shadow-emerald-500/30",
      },
    },
    {
      key: "expense",
      label: t("dashboard.expense"),
      value: current?.expense ?? 0,
      prev: previous?.expense ?? 0,
      icon: CreditCard,
      colors: {
        from: "from-rose-500/10",
        via: "via-red-500/5",
        orb: "from-rose-400/20",
        iconFrom: "from-rose-500",
        iconTo: "to-red-600",
        text: "text-rose-600 dark:text-rose-400",
        labelColor: "text-rose-700 dark:text-rose-300",
        iconShadow: "shadow-rose-500/30",
      },
    },
    {
      key: "saving",
      label: t("dashboard.saving"),
      value: current?.saving ?? 0,
      prev: previous?.saving ?? 0,
      icon: PiggyBank,
      tagline: t("dashboard.savingTagline" as any),
      colors: {
        from: "from-blue-500/10",
        via: "via-cyan-500/5",
        orb: "from-blue-400/20",
        iconFrom: "from-blue-500",
        iconTo: "to-cyan-600",
        text: "text-blue-600 dark:text-blue-400",
        labelColor: "text-blue-700 dark:text-blue-300",
        iconShadow: "shadow-blue-500/30",
      },
    },
    {
      key: "investment",
      label: t("dashboard.investment"),
      value: current?.investment ?? 0,
      prev: previous?.investment ?? 0,
      icon: TrendingUp,
      tagline: t("dashboard.investmentTagline" as any),
      colors: {
        from: "from-purple-500/10",
        via: "via-violet-500/5",
        orb: "from-purple-400/20",
        iconFrom: "from-purple-500",
        iconTo: "to-violet-600",
        text: "text-purple-600 dark:text-purple-400",
        labelColor: "text-purple-700 dark:text-purple-300",
        iconShadow: "shadow-purple-500/30",
      },
    },
    {
      key: "netBalance",
      label: t("dashboard.netBalance"),
      value: netBalance,
      prev: prevNetBalance,
      icon: Scale,
      colors: netBalance >= 0
        ? {
            from: "from-teal-500/10",
            via: "via-cyan-500/5",
            orb: "from-teal-400/20",
            iconFrom: "from-teal-500",
            iconTo: "to-cyan-600",
            text: "text-teal-600 dark:text-teal-400",
            labelColor: "text-teal-700 dark:text-teal-300",
            iconShadow: "shadow-teal-500/30",
          }
        : {
            from: "from-rose-500/10",
            via: "via-red-500/5",
            orb: "from-rose-400/20",
            iconFrom: "from-rose-500",
            iconTo: "to-red-600",
            text: "text-rose-600 dark:text-rose-400",
            labelColor: "text-rose-700 dark:text-rose-300",
            iconShadow: "shadow-rose-500/30",
          },
    },
  ], [t, current, previous, netBalance, prevNetBalance]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const change = pctChange(card.value, card.prev);
        const isUp = change !== null && change >= 0;
        // For expenses, "up" is bad, "down" is good — invert the color logic
        const isPositive = card.key === "expense" ? !isUp : isUp;

        return (
          <Card
            key={card.key}
            className={`group relative overflow-hidden rounded-2xl border-0 bg-linear-to-br ${card.colors.from} ${card.colors.via} to-transparent p-5 hover:shadow-lg transition-all duration-300`}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.colors.orb} to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
            />
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-xl bg-linear-to-br ${card.colors.iconFrom} ${card.colors.iconTo} shadow-lg ${card.colors.iconShadow} flex items-center justify-center mb-3`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div
                className={`text-xs font-medium ${card.colors.labelColor} mb-1.5`}
              >
                {card.label}
              </div>
              <div className={`text-xl font-bold ${card.colors.text}`}>
                {card.key === "income" ? "+" : card.key === "expense" ? "-" : card.key === "netBalance" ? (card.value >= 0 ? "+" : "") : ""}{formatCurrency(card.key === "netBalance" ? card.value : Math.abs(card.value), currency)}
              </div>
              {card.tagline && (
                <div className={`text-[10px] ${card.colors.labelColor} opacity-70 mt-1`}>
                  {card.tagline}
                </div>
              )}
              {change !== null && (
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isPositive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t("dashboard.vsLastMonth")}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
});
