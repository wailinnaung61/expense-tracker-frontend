import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { aggregationService } from "@/services/aggregationService";
import { Link } from "react-router-dom";
import type { ExpenseBreakdown, MonthlyAggregation } from "@/types/aggregation";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, PiggyBank, TrendingUp, ArrowRight, Wallet, CreditCard, Receipt } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import spinnerGif from "@/assets/Spinner.gif";

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

export default function TransactionStats({ currency = "USD", refreshKey = 0 }: TransactionStatsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<ExpenseBreakdown | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAggregation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const fetchExpenseBreakdown = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const monthStr = format(date, "yyyy-MM");
      const [breakdown, monthly] = await Promise.all([
        aggregationService.getExpenseBreakdown(monthStr),
        aggregationService.getMonthlyAggregation(monthStr),
      ]);
      setData(breakdown);
      setMonthlyData(monthly);
    } catch (err: any) {
      console.error("Failed to fetch expense breakdown:", err);
      setError(err.message || "Failed to load data");
      setData(null);
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when month changes
  useEffect(() => {
    fetchExpenseBreakdown(currentMonth);
  }, [currentMonth, fetchExpenseBreakdown]);

  // Immediate refresh when transaction changes (materialized view is ready immediately)
  useEffect(() => {
    if (refreshKey === 0) return; // Skip on initial mount
    fetchExpenseBreakdown(currentMonth);
  }, [refreshKey, currentMonth, fetchExpenseBreakdown]);

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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              {monthlyData ? (
                <>
                  <span className="text-xs">
                    {format(new Date(monthlyData.periodStart), "MMM dd")} - {format(new Date(monthlyData.periodEnd), "MMM dd, yyyy")}
                  </span>
                </>
              ) : (
                `${format(currentMonth, "MMMM yyyy")} financial summary`
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
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
                      <label className="text-xs font-semibold text-muted-foreground">Month</label>
                      <Select value={String(currentMonth.getMonth())} onValueChange={handleMonthChange}>
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">January</SelectItem>
                          <SelectItem value="1">February</SelectItem>
                          <SelectItem value="2">March</SelectItem>
                          <SelectItem value="3">April</SelectItem>
                          <SelectItem value="4">May</SelectItem>
                          <SelectItem value="5">June</SelectItem>
                          <SelectItem value="6">July</SelectItem>
                          <SelectItem value="7">August</SelectItem>
                          <SelectItem value="8">September</SelectItem>
                          <SelectItem value="9">October</SelectItem>
                          <SelectItem value="10">November</SelectItem>
                          <SelectItem value="11">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Year</label>
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
                    Done
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
                Today
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
            <Button variant="outline" size="sm" onClick={() => fetchExpenseBreakdown(currentMonth)}>
              Retry
            </Button>
          </div>
        ) : !data || chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No expenses for this month</p>
          </div>
        ) : (
          <>
            {/* Monthly Summary */}
            {monthlyData && (
              <div className="space-y-4 mb-6">
                {/* Financial Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-medium text-green-700 dark:text-green-300">Income</div>
                    </div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      +{formatCurrency(monthlyData.income, currency)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-medium text-red-700 dark:text-red-300">Expenses</div>
                    </div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                      -{formatCurrency(monthlyData.expense, currency)}
                    </div>
                  </div>
                  <Link to="/saving" className="block rounded-lg border bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3.5 hover:scale-[1.02] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <PiggyBank className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Saving</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">
                      {formatCurrency(monthlyData.saving, currency)}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400">Track your savings goals</div>
                  </Link>
                  <Link to="/investment" className="block rounded-lg border bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-3.5 hover:scale-[1.02] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Investment</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-1">
                      {formatCurrency(monthlyData.investment, currency)}
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400">View your investments</div>
                  </Link>
                  
                  {/* Net Savings - Highlighted */}
                  <div className={`col-span-2 rounded-lg border-2 p-4 ${
                    monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0
                      ? 'bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-300 dark:border-green-700'
                      : 'bg-linear-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900 border-red-300 dark:border-red-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}>
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Net Savings</div>
                          <div className={`text-2xl font-bold ${
                          monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                            {monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment >= 0 ? '+' : ''}
                            {formatCurrency(monthlyData.income - monthlyData.expense - monthlyData.saving - monthlyData.investment, currency)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">Transactions</div>
                        </div>
                        <div className="text-xl font-bold">{monthlyData.transactionCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Breakdown Chart */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">Expense Breakdown</h3>
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
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                <div className={`font-bold ${
                  formatCurrency(data.totalExpenses, currency).length > 15 
                    ? 'text-sm' 
                    : formatCurrency(data.totalExpenses, currency).length > 12 
                    ? 'text-base' 
                    : formatCurrency(data.totalExpenses, currency).length > 10
                    ? 'text-lg'
                    : 'text-2xl'
                } wrap-break-word text-center max-w-full`}>
                  {formatCurrency(data.totalExpenses, currency)}
                </div>
                <div className="text-xs text-muted-foreground">Total Expenses</div>
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
                    <span className="text-sm truncate">{entry.name}</span>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap ml-2">
                    {formatCurrency(entry.value, currency)} ({Math.round(entry.percentage)}%)
                  </div>
                </div>
              ))}
            </div>

            {data.comparison && (
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium">Monthly Comparison</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Month</span>
                  <span className="font-medium">
                    {formatCurrency(data.comparison.lastMonth, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>This Month</span>
                  <span className="font-medium">
                    {formatCurrency(data.comparison.thisMonth, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Difference</span>
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
