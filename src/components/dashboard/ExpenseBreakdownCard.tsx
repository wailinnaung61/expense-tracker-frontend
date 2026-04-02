import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseBreakdown } from "@/types/aggregation";
import { Cell, Label, Pie, PieChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, TrendingDown } from "lucide-react";

interface ExpenseBreakdownCardProps {
  breakdown: ExpenseBreakdown;
  currency: string;
}

const COLORS = [
  "rgba(34, 197, 94, 0.7)",   // green
  "rgba(59, 130, 246, 0.7)",  // blue
  "rgba(168, 85, 247, 0.7)",  // purple
  "rgba(249, 115, 22, 0.7)",  // orange
  "rgba(234, 179, 8, 0.7)",   // yellow
  "rgba(236, 72, 153, 0.7)",  // pink
  "rgba(14, 165, 233, 0.7)",  // cyan
  "rgba(139, 92, 246, 0.7)",  // violet
  "rgba(34, 211, 238, 0.7)",  // light cyan
  "rgba(156, 163, 175, 0.7)", // gray
];

export function ExpenseBreakdownCard({ breakdown, currency }: ExpenseBreakdownCardProps) {
  const { t } = useTranslation();

  const chartConfig: Record<string, { label: string; color: string }> = {};
  breakdown.categories.forEach((cat, i) => {
    chartConfig[cat.categoryName] = {
      label: cat.categoryName,
      color: COLORS[i % COLORS.length],
    };
  });

  const hasData = breakdown.categories.length > 0;
  const comp = breakdown.comparison;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("dashboard.expenseBreakdown")}</CardTitle>
        <CardDescription>{t("dashboard.expenseBreakdownDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <TrendingDown className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t("dashboard.noExpenses")}</p>
          </div>
        ) : (
          <>
            {/* Donut chart */}
            <ChartContainer config={chartConfig} className="mx-auto h-50 w-50">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value), currency)}
                    />
                  }
                />
                <Pie
                  data={breakdown.categories.map((c) => ({
                    name: c.categoryName,
                    value: c.amount,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {breakdown.categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-muted-foreground text-[10px]"
                            >
                              {t("dashboard.totalLabel" as any)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 10}
                              className="fill-foreground text-base font-bold"
                            >
                              {formatCurrency(breakdown.totalExpenses, currency)}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Category list */}
            <div className="space-y-2 mt-4">
              {breakdown.categories.slice(0, 5).map((cat, i) => (
                <div key={cat.categoryId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate text-muted-foreground">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium">{formatCurrency(cat.amount, currency)}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* MoM Comparison */}
            {comp && (
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {comp.percentageChange <= 0 ? (
                    <>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-semibold">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(comp.percentageChange).toFixed(1)}%
                      </span>
                      <span>{t("dashboard.lessLastMonth")}</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 font-semibold">
                        <ArrowUpRight className="h-3 w-3" />
                        {comp.percentageChange.toFixed(1)}%
                      </span>
                      <span>{t("dashboard.moreLastMonth")}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
