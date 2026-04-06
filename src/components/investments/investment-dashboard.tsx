import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentDashboard } from "@/types/investment";
import { TrendingUp, TrendingDown, Wallet, BarChart3, PieChart } from "lucide-react";

const translateAssetType = (type: string, t: any): string => {
  const typeMap: Record<string, string> = {
    'STOCK': 'investments.filters.stock',
    'CRYPTO': 'investments.filters.crypto',
    'BOND': 'investments.filters.bond',
    'MUTUALFUND': 'investments.filters.mutualFund',
    'REALESTATE': 'investments.filters.realEstate',
    'REAL_ESTATE': 'investments.filters.realEstate',
    'GOLD': 'investments.filters.gold',
    'OTHER': 'investments.filters.other',
  };
  return t(typeMap[type.toUpperCase()] || type);
};

interface InvestmentDashboardProps {
  dashboard: InvestmentDashboard;
  currency: string;
}

export function InvestmentDashboardView({ dashboard, currency }: InvestmentDashboardProps) {
  const { t } = useTranslation();
  const isProfit = dashboard.totalProfitLoss >= 0;

  const overviewCards = [
    {
      key: "invested",
      label: t("investments.dashboard.totalInvested"),
      value: formatCurrency(dashboard.totalInvested, currency),
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
      icon: Wallet,
    },
    {
      key: "current",
      label: t("investments.dashboard.currentValue"),
      value: formatCurrency(dashboard.currentValue, currency),
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
      icon: BarChart3,
    },
    {
      key: "pnl",
      label: t("investments.dashboard.profitLoss"),
      value: `${isProfit ? "+" : ""}${formatCurrency(dashboard.totalProfitLoss, currency)}`,
      colors: isProfit
        ? {
            from: "from-emerald-500/10",
            via: "via-green-500/5",
            orb: "from-emerald-400/20",
            iconFrom: "from-emerald-500",
            iconTo: "to-green-600",
            text: "text-emerald-600 dark:text-emerald-400",
            labelColor: "text-emerald-700 dark:text-emerald-300",
            hoverShadow: "hover:shadow-emerald-500/20",
            iconShadow: "shadow-emerald-500/30",
          }
        : {
            from: "from-rose-500/10",
            via: "via-red-500/5",
            orb: "from-rose-400/20",
            iconFrom: "from-rose-500",
            iconTo: "to-red-600",
            text: "text-rose-600 dark:text-rose-400",
            labelColor: "text-rose-700 dark:text-rose-300",
            hoverShadow: "hover:shadow-rose-500/20",
            iconShadow: "shadow-rose-500/30",
          },
      icon: isProfit ? TrendingUp : TrendingDown,
    },
    {
      key: "return",
      label: t("investments.dashboard.returnPercent"),
      value: `${isProfit ? "+" : ""}${dashboard.returnPercentage.toFixed(2)}%`,
      colors: isProfit
        ? {
            from: "from-purple-500/10",
            via: "via-violet-500/5",
            orb: "from-purple-400/20",
            iconFrom: "from-purple-500",
            iconTo: "to-violet-600",
            text: "text-purple-600 dark:text-purple-400",
            labelColor: "text-purple-700 dark:text-purple-300",
            hoverShadow: "hover:shadow-purple-500/20",
            iconShadow: "shadow-purple-500/30",
          }
        : {
            from: "from-rose-500/10",
            via: "via-red-500/5",
            orb: "from-rose-400/20",
            iconFrom: "from-rose-500",
            iconTo: "to-red-600",
            text: "text-rose-600 dark:text-rose-400",
            labelColor: "text-rose-700 dark:text-rose-300",
            hoverShadow: "hover:shadow-rose-500/20",
            iconShadow: "shadow-rose-500/30",
          },
      icon: PieChart,
    },
  ];

  return (
    <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <CardHeader className="border-b bg-card pb-4">
        <CardTitle className="text-foreground">{t("investments.dashboard.title")}</CardTitle>
        <CardDescription>{t("investments.dashboard.subtitle")}</CardDescription>
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

        {/* Asset Allocation */}
        {dashboard.assetAllocation.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t("investments.dashboard.assetAllocation")}</h3>
            <div className="space-y-2">
              {dashboard.assetAllocation.map((asset) => (
                <div key={asset.assetType} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{translateAssetType(asset.assetType, t)}</span>
                    <span className="font-medium">
                      {formatCurrency(asset.currentValue, currency)} ({asset.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={asset.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top / Worst Performers */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dashboard.topPerformers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {t("investments.dashboard.topPerformers")}
              </h3>
              {dashboard.topPerformers.map((inv) => (
                <div
                  key={inv.investmentId}
                  className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.assetName}</p>
                    <p className="text-xs text-muted-foreground">{inv.symbol}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +{inv.returnPercentage.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {dashboard.worstPerformers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" /> {t("investments.dashboard.worstPerformers")}
              </h3>
              {dashboard.worstPerformers.map((inv) => (
                <div
                  key={inv.investmentId}
                  className="flex justify-between items-center p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.assetName}</p>
                    <p className="text-xs text-muted-foreground">{inv.symbol}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {inv.returnPercentage.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
