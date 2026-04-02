import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import { aggregationService } from "@/services/aggregationService";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

type ViewMode = "daily" | "weekly" | "monthly" | "yearly";

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
  saving: number;
  investment: number;
}

interface TrendChartProps {
  currency: string;
  /** Sync with dashboard header month, e.g. "2026-04" */
  month?: string;
}

const QUARTER_WEEKS: Record<number, [number, number]> = {
  0: [1, 13],
  1: [14, 26],
  2: [27, 39],
  3: [40, 52],
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export function MonthlyTrendChart({ currency, month }: TrendChartProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync with dashboard header month picker — reset to monthly view
  useEffect(() => {
    if (month) {
      const [y, m] = month.split("-").map(Number);
      setCurrentDate(new Date(y, m - 1, 1));
      setViewMode("monthly");
    }
  }, [month]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let result: ChartDataPoint[] = [];

      const empty = { income: 0, expense: 0, saving: 0, investment: 0 };

      switch (viewMode) {
        case "daily": {
          const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
          const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
          const daily = await aggregationService.getDailyAggregations(start, end);
          const dayMap = new Map(daily.map((d) => [new Date(d.period).getDate(), d]));
          const daysInMonth = getDaysInMonth(currentDate);
          result = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const d = dayMap.get(day);
            return { label: String(day), ...(d ? { income: d.income, expense: d.expense, saving: d.saving, investment: d.investment } : empty) };
          });
          break;
        }
        case "weekly": {
          const quarter = Math.floor(currentDate.getMonth() / 3);
          const year = currentDate.getFullYear();
          const [startW, endW] = QUARTER_WEEKS[quarter];
          const weekly = await aggregationService.getWeeklyAggregations(
            `${year}-W${String(startW).padStart(2, "0")}`,
            `${year}-W${String(endW).padStart(2, "0")}`
          );
          const weekMap = new Map(weekly.map((w) => [w.period.split("-W")[1], w]));
          result = Array.from({ length: endW - startW + 1 }, (_, i) => {
            const wNum = String(startW + i).padStart(2, "0");
            const w = weekMap.get(wNum);
            return { label: `W${wNum}`, ...(w ? { income: w.income, expense: w.expense, saving: w.saving, investment: w.investment } : empty) };
          });
          break;
        }
        case "monthly": {
          const year = currentDate.getFullYear();
          const monthly = await aggregationService.getMonthlyAggregations(
            `${year}-01`,
            `${year}-12`
          );
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const monthMap = new Map(monthly.map((m) => {
            const mm = parseInt(m.period.split("-")[1], 10);
            return [mm, m];
          }));
          result = Array.from({ length: 12 }, (_, i) => {
            const m = monthMap.get(i + 1);
            return { label: monthNames[i], ...(m ? { income: m.income, expense: m.expense, saving: m.saving, investment: m.investment } : empty) };
          });
          break;
        }
        case "yearly": {
          const thisYear = new Date().getFullYear();
          const yearly = await aggregationService.getYearlyAggregations(
            `${thisYear - 4}`,
            `${thisYear}`
          );
          const yearMap = new Map(yearly.map((y) => [y.period, y]));
          result = Array.from({ length: 5 }, (_, i) => {
            const yr = String(thisYear - 4 + i);
            const y = yearMap.get(yr);
            return { label: yr, ...(y ? { income: y.income, expense: y.expense, saving: y.saving, investment: y.investment } : empty) };
          });
          break;
        }
      }

      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation adapts per view mode
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "daily") d.setMonth(d.getMonth() - 1);
      else if (viewMode === "weekly") d.setMonth(d.getMonth() - 3);
      else if (viewMode === "monthly") d.setFullYear(d.getFullYear() - 1);
      return d;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "daily") d.setMonth(d.getMonth() + 1);
      else if (viewMode === "weekly") d.setMonth(d.getMonth() + 3);
      else if (viewMode === "monthly") d.setFullYear(d.getFullYear() + 1);
      return d;
    });
  }, [viewMode]);

  const handleMonthChange = useCallback((month: string) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(parseInt(month));
      return d;
    });
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setFullYear(parseInt(year));
      return d;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const isCurrentPeriod = useMemo(() => {
    const now = new Date();
    if (viewMode === "daily") return format(currentDate, "yyyy-MM") === format(now, "yyyy-MM");
    if (viewMode === "weekly") return Math.floor(currentDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && currentDate.getFullYear() === now.getFullYear();
    if (viewMode === "monthly") return currentDate.getFullYear() === now.getFullYear();
    return true;
  }, [viewMode, currentDate]);

  const monthKeys = ["common.january","common.february","common.march","common.april","common.may","common.june","common.july","common.august","common.september","common.october","common.november","common.december"] as const;

  // Label matches what the API actually fetches
  const periodLabel = useMemo(() => {
    if (viewMode === "daily") return `${t(monthKeys[currentDate.getMonth()])} ${currentDate.getFullYear()}`;
    if (viewMode === "weekly") {
      const q = Math.floor(currentDate.getMonth() / 3) + 1;
      return `Q${q} ${currentDate.getFullYear()}`;
    }
    if (viewMode === "monthly") return String(currentDate.getFullYear());
    return "";
  }, [viewMode, currentDate, t]);

  const chartConfig = {
    income: { label: t("dashboard.income"), color: "#10b981" },
    expense: { label: t("dashboard.expense"), color: "#f43f5e" },
    saving: { label: t("dashboard.saving"), color: "#3b82f6" },
    investment: { label: t("dashboard.investment"), color: "#8b5cf6" },
  };

  const barSize = viewMode === "daily" ? 6 : viewMode === "yearly" ? 32 : 16;
  const viewModes: ViewMode[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">{t("dashboard.monthlyTrend")}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Date picker — adapts per view mode */}
            {viewMode !== "yearly" && (
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium hover:bg-accent">
                      {periodLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={viewMode === "monthly" ? "w-40 p-4" : "w-70 p-4"} align="end" sideOffset={8}>
                    <div className="space-y-4">
                      <div className={viewMode === "monthly" ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2"}>
                        {/* Daily: Month select */}
                        {viewMode === "daily" && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("reports.month" as any)}</label>
                            <Select value={String(currentDate.getMonth())} onValueChange={handleMonthChange}>
                              <SelectTrigger className="h-9 bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">{t("common.january")}</SelectItem>
                                <SelectItem value="1">{t("common.february")}</SelectItem>
                                <SelectItem value="2">{t("common.march")}</SelectItem>
                                <SelectItem value="3">{t("common.april")}</SelectItem>
                                <SelectItem value="4">{t("common.may")}</SelectItem>
                                <SelectItem value="5">{t("common.june")}</SelectItem>
                                <SelectItem value="6">{t("common.july")}</SelectItem>
                                <SelectItem value="7">{t("common.august")}</SelectItem>
                                <SelectItem value="8">{t("common.september")}</SelectItem>
                                <SelectItem value="9">{t("common.october")}</SelectItem>
                                <SelectItem value="10">{t("common.november")}</SelectItem>
                                <SelectItem value="11">{t("common.december")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {/* Weekly: Quarter select */}
                        {viewMode === "weekly" && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("reports.quarter" as any)}</label>
                            <Select value={String(Math.floor(currentDate.getMonth() / 3))} onValueChange={(v) => {
                              setCurrentDate((prev) => {
                                const d = new Date(prev);
                                d.setMonth(parseInt(v) * 3);
                                return d;
                              });
                            }}>
                              <SelectTrigger className="h-9 bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Q1</SelectItem>
                                <SelectItem value="1">Q2</SelectItem>
                                <SelectItem value="2">Q3</SelectItem>
                                <SelectItem value="3">Q4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {/* Year select — always shown */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">{t("reports.year" as any)}</label>
                          <Select value={String(currentDate.getFullYear())} onValueChange={handleYearChange}>
                            <SelectTrigger className="h-9 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOptions.map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button size="sm" className="w-full h-9" onClick={() => setPickerOpen(false)}>
                        {t("reports.done" as any)}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {!isCurrentPeriod && (
                  <Button variant="ghost" size="sm" onClick={handleToday} className="h-7 px-2 text-xs">
                    {t("reports.today" as any)}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              {viewModes.map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-6 px-2.5"
                  onClick={() => setViewMode(mode)}
                >
                  {t(`reports.${mode}` as any)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-75">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-75 text-muted-foreground gap-2">
            <BarChart3 className="h-12 w-12 opacity-30" />
            <p className="text-sm">{t("reports.noData" as any)}</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart
                data={data}
                barCategoryGap={viewMode === "daily" ? 2 : 16}
                barGap={viewMode === "daily" ? 1 : 3}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  interval={viewMode === "daily" ? 2 : 0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  className="text-xs"
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                    return String(v);
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(Number(value), currency)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={barSize} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={barSize} />
                <Bar dataKey="saving" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={barSize} />
                <Bar dataKey="investment" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={barSize} />
              </BarChart>
            </ChartContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              {Object.entries(chartConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cfg.color }} />
                  {cfg.label}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
