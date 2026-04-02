import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentDashboard } from "@/types/investment";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3 } from "lucide-react";

interface InvestmentSnapshotProps {
  investment: InvestmentDashboard;
  currency: string;
}

export function InvestmentSnapshot({ investment, currency }: InvestmentSnapshotProps) {
  const { t } = useTranslation();
  const isProfit = investment.totalProfitLoss >= 0;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.investments")}</CardTitle>
          <Link
            to="/investment"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isProfit
                ? "bg-linear-to-br from-purple-500 to-violet-600 shadow-purple-500/30"
                : "bg-linear-to-br from-rose-500 to-red-600 shadow-rose-500/30"
            }`}
          >
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(investment.currentValue, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.invested")} {formatCurrency(investment.totalInvested, currency)}
            </p>
          </div>
        </div>

        {/* P&L badge */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl ${
            isProfit
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : "bg-rose-50 dark:bg-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span className="text-sm font-medium">
              {t("dashboard.profitLoss")}
            </span>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-bold ${
                isProfit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(investment.totalProfitLoss, currency)}
            </p>
            <p
              className={`text-[11px] font-medium ${
                isProfit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isProfit ? "+" : ""}
              {investment.returnPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Asset allocation (compact) */}
        {investment.assetAllocation.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {t("dashboard.assetAllocation")}
            </p>
            {/* Stacked bar */}
            <div className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden flex">
              {investment.assetAllocation.map((asset, i) => {
                const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
                return (
                  <div
                    key={asset.assetType}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${asset.percentage}%`,
                      background: colors[i % colors.length],
                    }}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {investment.assetAllocation.map((asset, i) => {
                const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
                return (
                  <div key={asset.assetType} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ background: colors[i % colors.length] }}
                    />
                    {asset.assetType} {asset.percentage.toFixed(0)}%
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
