import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { aggregationService } from "@/services/aggregationService";
import type { ExpenseBreakdown } from "@/types/aggregation";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import spinnerGif from "@/assets/Spinner.gif";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchExpenseBreakdown = useCallback(async (date: Date, isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setRetryCount(0);
    }
    setError(null);
    try {
      const monthStr = format(date, "yyyy-MM");
      const breakdown = await aggregationService.getExpenseBreakdown(monthStr);
      setData(breakdown);
      setRetryCount(0);
    } catch (err: any) {
      console.error("Failed to fetch expense breakdown:", err);
      setError(err.message || "Failed to load data");
      setData(null);
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch when month changes
  useEffect(() => {
    fetchExpenseBreakdown(currentMonth);
  }, [currentMonth, fetchExpenseBreakdown]);

  // Smart retry for lambda eventual consistency when refreshKey changes
  // Real-world pattern: AWS Lambda aggregations are eventually consistent
  // - Try immediately (might be cached or fast execution)
  // - Retry after 1s (lambda cold start or processing time)
  // - Final retry after 3s total (ensure we get updated data)
  useEffect(() => {
    if (refreshKey === 0) return; // Skip on initial mount

    let timer1: number;
    let timer2: number;
    
    const delayedRefresh = async () => {
      // Show syncing indicator for entire retry period
      setRetryCount(1);
      
      // First immediate attempt
      await fetchExpenseBreakdown(currentMonth, true);
      
      // Retry after 1 second (lambda might still be processing)
      timer1 = setTimeout(async () => {
        await fetchExpenseBreakdown(currentMonth, true);
        
        // Final retry after 2 more seconds if needed
        timer2 = setTimeout(async () => {
          await fetchExpenseBreakdown(currentMonth, true);
          setRetryCount(0); // Done with all retries
        }, 2000);
      }, 1000);
    };

    delayedRefresh();

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      setRetryCount(0);
    };
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
            <div className="flex items-center gap-2">
              <CardTitle>Expense Breakdown</CardTitle>
              {retryCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
            </div>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy")} spending by category
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
