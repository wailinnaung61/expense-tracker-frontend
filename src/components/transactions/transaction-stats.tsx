import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { aggregationService } from "@/services/aggregationService";
import { Link } from "react-router-dom";
import type { ExpenseBreakdown, MonthlyAggregation } from "@/types/aggregation";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, PiggyBank, TrendingUp, ArrowRight, Wallet, CreditCard, Receipt, CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import spinnerGif from "@/assets/Spinner.gif";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionStatsProps {
  currency?: string;
  refreshKey?: number;
}

// Predefined color palette for consistency
const COLORS = [
  "rgba(34, 197, 94, 0.7)",   // green
  "rgba(59, 130, 246, 0.7)",   // blue
  "rgba(168, 85, 247, 0.7)",   // purple
  "rgba(249, 115, 22, 0.7)",   // orange
  "rgba(234, 179, 8, 0.7)",    // yellow
  "rgba(236, 72, 153, 0.7)",   // pink
  "rgba(14, 165, 233, 0.7)",   // cyan
  "rgba(139, 92, 246, 0.7)",   // violet
  "rgba(34, 211, 238, 0.7)",   // light cyan
  "rgba(156, 163, 175, 0.7)",  // gray
];

function dateFromYyyyMmDd(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function TransactionStats({ currency = "USD", refreshKey = 0 }: TransactionStatsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<ExpenseBreakdown | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAggregation | null>(null);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [customEndDate, setCustomEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const { t } = useTranslation();
  const queryRef = useRef({
    currentMonth,
    useCustomRange,
    customStartDate,
    customEndDate,
  });

  queryRef.current = {
    currentMonth,
    useCustomRange,
    customStartDate,
    customEndDate,
  };

  const fetchExpenseBreakdown = useCallback(async (
    date: Date,
    options?: { useCustomRange?: boolean; customStartDate?: string; customEndDate?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const shouldUseCustomRange = options?.useCustomRange ?? false;
      if (shouldUseCustomRange) {
        const startDate = options?.customStartDate ?? "";
        const endDate = options?.customEndDate ?? "";

        if (!startDate || !endDate) {
          setError(t("transactions.stats.customDateRequired"));
          setData(null);
          setMonthlyData(null);
          return;
        }

        if (startDate > endDate) {
          setError(t("transactions.stats.customDateInvalid"));
          setData(null);
          setMonthlyData(null);
          return;
        }

        const customAggregation = await aggregationService.getCustomDateAggregation(startDate, endDate);
        setData(customAggregation.breakdown);
        setMonthlyData(customAggregation.summary);
        return;
      }

      const monthStr = format(date, "yyyy-MM");
      const [breakdown, monthly] = await Promise.all([
        aggregationService.getExpenseBreakdown(monthStr),
        aggregationService.getMonthlyAggregation(monthStr),
      ]);
      setData(breakdown);
      setMonthlyData(monthly);
    } catch (err: any) {
      console.error("Failed to fetch expense breakdown:", err);
      setError(err.message || t("errors.fetchFailed"));
      setData(null);
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when month changes
  useEffect(() => {
    fetchExpenseBreakdown(currentMonth, {
      useCustomRange,
      customStartDate,
      customEndDate,
    });
  }, [currentMonth, fetchExpenseBreakdown, useCustomRange, customStartDate, customEndDate]);

  // Refresh when transaction changes - retry with delay for backend aggregation consistency
  useEffect(() => {
    if (refreshKey === 0) return; // Skip on initial mount
    const {
      currentMonth: latestMonth,
      useCustomRange: latestUseCustomRange,
      customStartDate: latestCustomStartDate,
      customEndDate: latestCustomEndDate,
    } = queryRef.current;

    fetchExpenseBreakdown(latestMonth, {
      useCustomRange: latestUseCustomRange,
      customStartDate: latestCustomStartDate,
      customEndDate: latestCustomEndDate,
    });
    // Retry after a short delay to catch backend aggregation updates
    const timer = setTimeout(() => {
      const {
        currentMonth: retryMonth,
        useCustomRange: retryUseCustomRange,
        customStartDate: retryCustomStartDate,
        customEndDate: retryCustomEndDate,
      } = queryRef.current;

      fetchExpenseBreakdown(retryMonth, {
        useCustomRange: retryUseCustomRange,
        customStartDate: retryCustomStartDate,
        customEndDate: retryCustomEndDate,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [refreshKey, fetchExpenseBreakdown]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const handleCurrentMonth = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleMonthChange = useCallback((month: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(month));
    setCurrentMonth(newDate);
  }, [currentMonth]);

  const handleYearChange = useCallback((year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
  }, [currentMonth]);

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const isCurrentMonth = useMemo(() => 
    format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM"),
    [currentMonth]
  );

  const handleUseMonthly = useCallback(() => {
    setUseCustomRange(false);
  }, []);

  const handleUseCustomRange = useCallback(() => {
    setUseCustomRange(true);
    if (!customStartDate || !customEndDate) {
      const today = format(new Date(), "yyyy-MM-dd");
      setCustomStartDate(today);
      setCustomEndDate(today);
    }
  }, [customStartDate, customEndDate]);

  const customStartDateObj = useMemo(() => dateFromYyyyMmDd(customStartDate), [customStartDate]);
  const customEndDateObj = useMemo(() => dateFromYyyyMmDd(customEndDate), [customEndDate]);

  // Transform data for pie chart with colors
  const chartData = useMemo(() => 
    data?.categories.map((cat, index) => ({
      name: cat.categoryName,
      value: cat.amount,
      color: COLORS[index % COLORS.length],
      percentage: cat.percentage,
    })) || [],
    [data]
  );

  return (
    <Card className="sticky top-12">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="w-full basis-full">
            <CardTitle className="leading-snug whitespace-normal break-normal dark:text-slate-50">
              {t("transactions.stats.title")}
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              {monthlyData ? (
                <>
                  <span className="text-xs">
                    {format(new Date(monthlyData.periodStart), "MMM dd")} - {format(new Date(monthlyData.periodEnd), "MMM dd, yyyy")}
                  </span>
                </>
              ) : (
                t("transactions.stats.financialSummary", { month: format(currentMonth, "MMMM yyyy") })
              )}
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap items-center gap-1">
            <Button
              variant={!useCustomRange ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleUseMonthly}
            >
              {t("transactions.stats.monthlyMode")}
            </Button>
            <Button
              variant={useCustomRange ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleUseCustomRange}
            >
              {t("transactions.stats.customMode")}
            </Button>

            {useCustomRange ? (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 w-36 justify-start text-left text-xs font-normal"
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {customStartDateObj ? format(customStartDateObj, "MMM dd, yyyy") : t("transactions.stats.customStartDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDateObj}
                      onSelect={(d) => setCustomStartDate(d ? format(d, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 w-36 justify-start text-left text-xs font-normal"
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {customEndDateObj ? format(customEndDateObj, "MMM dd, yyyy") : t("transactions.stats.customEndDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDateObj}
                      onSelect={(d) => setCustomEndDate(d ? format(d, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : null}

            {!useCustomRange && (
              <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs font-medium hover:bg-accent"
                >
                  {format(currentMonth, "MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-70 p-4" align="center" sideOffset={8}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t("transactions.stats.month")}</label>
                      <Select value={String(currentMonth.getMonth())} onValueChange={handleMonthChange}>
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
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t("transactions.stats.year")}</label>
                      <Select value={String(currentMonth.getFullYear())} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full h-9" 
                    onClick={() => setMonthPickerOpen(false)}
                  >
                    {t("transactions.stats.done")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {!isCurrentMonth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCurrentMonth}
                className="h-7 px-2 text-xs"
              >
                {t("transactions.stats.today")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                fetchExpenseBreakdown(currentMonth, {
                  useCustomRange,
                  customStartDate,
                  customEndDate,
                })
              }
            >
              {t("transactions.stats.retry")}
            </Button>
          </div>
        ) : !data || chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("transactions.stats.noExpenses")}</p>
          </div>
        ) : (
          <>
            {/* Monthly Summary */}
            {monthlyData && (
              <div className="space-y-4 mb-6">
                {/* Financial Summary Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Income Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500/10 via-green-500/5 to-transparent dark:from-emerald-500/20 dark:via-green-500/10 p-4 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-3">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1.5">{t("transactions.stats.income")}</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(monthlyData.income, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Expenses Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-500/20 dark:via-red-500/10 p-4 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-rose-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-linear-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 flex items-center justify-center mb-3">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-1.5">{t("transactions.stats.expenses")}</div>
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(monthlyData.expense, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Saving Card */}
                  <Link to="/saving" className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-500/20 dark:via-cyan-500/10 p-4 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                          <PiggyBank className="w-5 h-5 text-white" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5">{t("transactions.stats.saving")}</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {formatCurrency(monthlyData.saving, currency)}
                      </div>
                      <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">{t("transactions.stats.savingTagline")}</div>
                    </div>
                  </Link>

                  {/* Investment Card */}
                  <Link to="/investment" className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500/10 via-violet-500/5 to-transparent dark:from-purple-500/20 dark:via-violet-500/10 p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1.5">{t("transactions.stats.investment")}</div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {formatCurrency(monthlyData.investment, currency)}
                      </div>
                      <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70">{t("transactions.stats.investmentTagline")}</div>
                    </div>
                  </Link>
                  
                  {/* Net Savings - Highlighted */}
                  <div className={`col-span-2 group relative overflow-hidden rounded-2xl p-5 ${
                    monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0
                      ? 'bg-linear-to-br from-emerald-500/15 via-green-500/10 to-teal-500/5 dark:from-emerald-500/25 dark:via-green-500/15 hover:shadow-xl hover:shadow-emerald-500/25'
                      : 'bg-linear-to-br from-rose-500/15 via-red-500/10 to-orange-500/5 dark:from-rose-500/25 dark:via-red-500/15 hover:shadow-xl hover:shadow-rose-500/25'
                  } transition-all duration-300`}>
                    <div className={`absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-30 group-hover:scale-125 transition-transform duration-500 ${
                      monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0
                        ? 'bg-linear-to-br from-emerald-400 to-green-500'
                        : 'bg-linear-to-br from-rose-400 to-red-500'
                    }`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center ${
                          monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0
                            ? 'bg-linear-to-br from-emerald-500 to-green-600 shadow-emerald-500/40'
                            : 'bg-linear-to-br from-rose-500 to-red-600 shadow-rose-500/40'
                        }`}>
                          <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground dark:text-slate-400 mb-1.5">{t("transactions.stats.netSavings")}</div>
                          <div className={`text-3xl font-bold tracking-tight ${
                          monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            {monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0 ? '+' : ''}
                            {formatCurrency(monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment, currency)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1.5">
                          <Receipt className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
                          <div className="text-xs text-muted-foreground dark:text-slate-400">{t("transactions.stats.transactionCount")}</div>
                        </div>
                        <div className="text-2xl font-bold dark:text-slate-50">{monthlyData.transactionCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Breakdown Chart */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4 dark:text-slate-50">{t("transactions.stats.expenseBreakdown")}</h3>
              <div className="relative h-60 flex items-center justify-center">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(value: number, name: string, props: any) => [
                      `${formatCurrency(value, currency)} (${Math.round(props.payload.percentage)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none">
                <div className={`font-bold dark:text-slate-50 ${
                  formatCurrency(data.totalExpenses, currency).length > 15 
                    ? 'text-xs' 
                    : formatCurrency(data.totalExpenses, currency).length > 12 
                    ? 'text-sm' 
                    : formatCurrency(data.totalExpenses, currency).length > 10
                    ? 'text-base'
                    : 'text-lg'
                } wrap-break-word text-center max-w-full`}>
                  {formatCurrency(data.totalExpenses, currency)}
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-400">{t("transactions.stats.totalExpenses")}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm truncate dark:text-slate-50">{entry.name}</span>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap ml-2 dark:text-slate-50">
                    {formatCurrency(entry.value, currency)} ({Math.round(entry.percentage)}%)
                  </div>
                </div>
              ))}
            </div>

            {data.comparison && (
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium dark:text-slate-50">{t("transactions.stats.monthlyComparison")}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-slate-100">{t("transactions.stats.lastMonth")}</span>
                  <span className="font-medium dark:text-slate-50">
                    {formatCurrency(data.comparison.lastMonth, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-slate-100">{t("transactions.stats.thisMonth")}</span>
                  <span className="font-medium dark:text-slate-50">
                    {formatCurrency(data.comparison.thisMonth, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="dark:text-slate-100">{t("transactions.stats.difference")}</span>
                  <span
                    className={`font-medium ${
                      data.comparison.difference >= 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {data.comparison.difference >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(data.comparison.difference), currency)} (
                    {data.comparison.difference >= 0 ? "+" : ""}
                    {data.comparison.percentageChange.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
