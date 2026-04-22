import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, endOfMonth } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import {
  CHATBOT_REFRESH_EVENT,
  type ChatbotRefreshEventDetail,
} from "@/lib/chatbot-refresh";
import { aggregationService } from "@/services/aggregationService";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { profileService } from "@/services/profileService";
import { exportService } from "@/services/exportService";
import { toast } from "react-toastify";
import type { MonthlyAggregation, ExpenseBreakdownCategory } from "@/types/aggregation";
import type { Transaction } from "@/types/transaction";
import type { ExpenseCategory } from "@/types/category";
import type { ProfileResponse } from "@/types/profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Calendar,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import spinnerGif from "@/assets/Spinner.gif";

const TransactionTypeMap: Record<number, string> = {
  0: "Income",
  1: "Expense",
  2: "Investment",
  3: "Savings",
};

const TYPE_COLORS: Record<number, string> = {
  0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  1: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  2: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  3: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

const RADIAL_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f97316",
  "#eab308", "#ec4899", "#0ea5e9", "#14b8a6",
  "#f43f5e", "#6366f1",
];

function parseYyyyMmParam(value: string | null): { y: number; m: number } | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [ys, ms] = value.split("-");
  const y = Number(ys);
  const m = Number(ms) - 1;
  if (!Number.isFinite(y) || m < 0 || m > 11) return null;
  return { y, m };
}

export default function Reports() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const appliedUrlPrefillRef = useRef(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(0);
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [pickerOpen, setPickerOpen] = useState(false);

  const [monthlyData, setMonthlyData] = useState<MonthlyAggregation[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<ExpenseBreakdownCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Refs to avoid stale closures & double-fetch from deps changing
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const currency = profile?.currency || "USD";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const monthKeys = [
    "common.january", "common.february", "common.march", "common.april",
    "common.may", "common.june", "common.july", "common.august",
    "common.september", "common.october", "common.november", "common.december",
  ] as const;

  const startStr = `${year}-${String(startMonth + 1).padStart(2, "0")}`;
  const endStr = `${year}-${String(endMonth + 1).padStart(2, "0")}`;

  const periodLabel = useMemo(() => {
    if (startMonth === endMonth) return `${t(monthKeys[startMonth])} ${year}`;
    return `${t(monthKeys[startMonth])} - ${t(monthKeys[endMonth])} ${year}`;
  }, [startMonth, endMonth, year, t]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(startMonth + 1).padStart(2, "0")}-01`;
      const endDate = format(endOfMonth(new Date(year, endMonth, 1)), "yyyy-MM-dd");

      const cachedProfile = profileRef.current;
      const cachedCategories = categoriesRef.current;

      const [monthly, breakdown, txRes, catRes, prof] = await Promise.all([
        aggregationService.getMonthlyAggregations(startStr, endStr),
        aggregationService.getExpenseBreakdownByRange(startDate, endDate),
        transactionService.getTransactions({ startDate, endDate, pageSize: 50 }),
        cachedCategories.length > 0
          ? Promise.resolve({ items: cachedCategories })
          : categoryService.getCategories({ pageSize: 100 }),
        cachedProfile ? Promise.resolve(cachedProfile) : profileService.getProfile(),
      ]);

      const monthMap = new Map(monthly.map((m) => [m.period, m]));
      const fullMonthly: MonthlyAggregation[] = [];
      for (let m = startMonth; m <= endMonth; m++) {
        const period = `${year}-${String(m + 1).padStart(2, "0")}`;
        const existing = monthMap.get(period);
        fullMonthly.push(
          existing ?? {
            period,
            periodStart: `${year}/${String(m + 1).padStart(2, "0")}/01`,
            periodEnd: format(endOfMonth(new Date(year, m, 1)), "yyyy/MM/dd"),
            income: 0, expense: 0, saving: 0, investment: 0, transactionCount: 0,
          }
        );
      }

      setMonthlyData(fullMonthly);
      setCategoryBreakdown(breakdown.categories);
      setTransactions(txRes.items);
      if (!cachedProfile) setProfile(prof);
      if (cachedCategories.length === 0) setCategories(catRes.items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [startStr, endStr, year, startMonth, endMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (appliedUrlPrefillRef.current) return;
    const sm = searchParams.get("startMonth");
    const em = searchParams.get("endMonth");
    if (!sm && !em) return;
    const a = parseYyyyMmParam(sm);
    const b = parseYyyyMmParam(em);
    if (!a && !b) return;
    appliedUrlPrefillRef.current = true;

    const monthKey = (x: { y: number; m: number }) => x.y * 12 + x.m;

    if (a && b) {
      const [first, second] = monthKey(a) <= monthKey(b) ? [a, b] : [b, a];
      if (first.y === second.y) {
        setYear(first.y);
        setStartMonth(first.m);
        setEndMonth(second.m);
      } else {
        setYear(first.y);
        setStartMonth(first.m);
        setEndMonth(11);
      }
    } else if (a) {
      setYear(a.y);
      setStartMonth(a.m);
      setEndMonth(a.m);
    } else if (b) {
      setYear(b.y);
      setStartMonth(0);
      setEndMonth(b.m);
    }
  }, [searchParams]);

  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const { target } = (event as CustomEvent<ChatbotRefreshEventDetail>).detail;
      if (
        target === "transactions" ||
        target === "summary" ||
        target === "budget" ||
        target === "savings" ||
        target === "investments" ||
        target === "categories" ||
        target === "recurring_payments"
      ) {
        fetchData();
      }
    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, [fetchData]);

  const totals = useMemo(() => {
    return monthlyData.reduce(
      (acc, m) => ({
        income: acc.income + m.income,
        expense: acc.expense + m.expense,
        saving: acc.saving + m.saving,
        investment: acc.investment + m.investment,
        transactionCount: acc.transactionCount + m.transactionCount,
      }),
      { income: 0, expense: 0, saving: 0, investment: 0, transactionCount: 0 }
    );
  }, [monthlyData]);

  const netBalance = totals.income - totals.expense - totals.saving - totals.investment;

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.categoryId, c])),
    [categories]
  );

  // Savings Rate: (Income - Expense) / Income * 100
  const savingsRate = useMemo(() => {
    if (totals.income === 0) return 0;
    return Math.max(0, Math.min(100, ((totals.income - totals.expense) / totals.income) * 100));
  }, [totals]);

  // Top 5 biggest expense transactions
  const top5Expenses = useMemo(() => {
    return [...transactions]
      .filter((tx) => tx.type === 1)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // Chart data for area chart
  const areaChartData = useMemo(() => {
    return monthlyData.map((m) => {
      const monthIdx = parseInt(m.period.split("-")[1], 10) - 1;
      return {
        month: t(monthKeys[monthIdx]),
        income: m.income,
        expense: m.expense,
      };
    });
  }, [monthlyData, t]);

  // Pie data for category breakdown (half-donut)
  const pieData = useMemo(() => {
    return categoryBreakdown.slice(0, 8).map((cat, i) => ({
      name: cat.categoryName,
      value: cat.amount,
      percentage: cat.percentage,
      fill: RADIAL_COLORS[i % RADIAL_COLORS.length],
    }));
  }, [categoryBreakdown]);

  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => y + 1);
  const handleThisYear = () => {
    setYear(new Date().getFullYear());
    setStartMonth(0);
    setEndMonth(new Date().getMonth());
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await toast.promise(
        exportService.exportAndDownload(
          {
            startMonth: startStr,
            endMonth: endStr,
          }
        ),
        {
          pending: "Preparing export...",
          success: "Export downloaded successfully!",
          error: {
            render({ data }: any) {
              const errorMessage = data instanceof Error ? data.message : "Failed to export data. Please try again.";
              return errorMessage;
            }
          }
        }
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("reports.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {periodLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end" sideOffset={8}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t("reports.startMonth" as any)}</label>
                      <Select value={String(startMonth)} onValueChange={(v) => {
                        const m = parseInt(v);
                        setStartMonth(m);
                        if (m > endMonth) setEndMonth(m);
                      }}>
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthKeys.map((key, i) => (
                            <SelectItem key={i} value={String(i)}>{t(key)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t("reports.endMonth" as any)}</label>
                      <Select value={String(endMonth)} onValueChange={(v) => {
                        const m = parseInt(v);
                        setEndMonth(m);
                        if (m < startMonth) setStartMonth(m);
                      }}>
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthKeys.map((key, i) => (
                            <SelectItem key={i} value={String(i)}>{t(key)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t("reports.year" as any)}</label>
                      <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
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
            {!(year === new Date().getFullYear() && startMonth === 0 && endMonth === new Date().getMonth()) && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleThisYear}>
                {t("reports.thisYear" as any)}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5" 
            onClick={handleExport}
            disabled={isExporting || loading}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {isExporting ? t("reports.exporting" as any) || "Exporting..." : t("reports.export" as any)}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t("reports.totalIncome"), value: totals.income, icon: Wallet, color: "text-emerald-600 dark:text-emerald-400", prefix: "+" },
          { label: t("reports.totalExpense"), value: totals.expense, icon: CreditCard, color: "text-rose-600 dark:text-rose-400", prefix: "-" },
          { label: t("reports.totalSaving"), value: totals.saving, icon: PiggyBank, color: "text-blue-600 dark:text-blue-400", prefix: "" },
          { label: t("reports.totalInvestment"), value: totals.investment, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400", prefix: "" },
          {
            label: t("reports.netBalance" as any),
            value: netBalance,
            icon: Wallet,
            color: netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            prefix: netBalance >= 0 ? "+" : "",
            span: true,
          },
        ].map((card) => (
          <Card key={card.label} className={`rounded-2xl ${(card as any).span ? "col-span-2 lg:col-span-1" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              </div>
              <div className={`text-lg font-bold ${card.color}`}>
                {card.prefix}{formatCurrency(Math.abs(card.value), currency)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income vs Expense Area Chart + Savings Rate Ring + Top 5 Expenses */}
      <div className="grid grid-cols-12 gap-6">
        {/* Income vs Expense Area Chart */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="rounded-2xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("reports.incomeVsExpense")}</CardTitle>
              <CardDescription className="text-xs">{t("reports.incomeVsExpenseDesc" as any)}</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">{t("reports.noData")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={areaChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value, currency),
                        name === "income" ? t("reports.totalIncome") : t("reports.totalExpense"),
                      ]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">
                          {value === "income" ? t("reports.totalIncome") : t("reports.totalExpense")}
                        </span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#incomeGrad)"
                      dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fill="url(#expenseGrad)"
                      dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Savings Rate Ring */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <Card className="rounded-2xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("reports.savingsRate" as any)}</CardTitle>
              <CardDescription className="text-xs">{t("reports.savingsRateDesc" as any)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={savingsRate >= 20 ? "#10b981" : savingsRate >= 10 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(savingsRate / 100) * 314.16} 314.16`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" : savingsRate >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {savingsRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {t("reports.savingsRate" as any)}
                  </span>
                </div>
              </div>
              <div className="text-center mt-4 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("reports.savingsRateFormula" as any)}
                </p>
                <p className={`text-sm font-semibold ${savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" : savingsRate >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {savingsRate >= 20 ? t("reports.rateExcellent" as any) : savingsRate >= 10 ? t("reports.rateGood" as any) : t("reports.rateNeedsWork" as any)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Expenses */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <Card className="rounded-2xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                {t("reports.top5Expenses" as any)}
              </CardTitle>
              <CardDescription className="text-xs">{t("reports.top5ExpensesDesc" as any)}</CardDescription>
            </CardHeader>
            <CardContent>
              {top5Expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("reports.noData")}</p>
              ) : (
                <div className="space-y-3">
                  {top5Expenses.map((tx, idx) => {
                    const cat = catMap.get(tx.categoryId);
                    const medals = ["🥇", "🥈", "🥉"];
                    const maxAmount = top5Expenses[0]?.amount || 1;
                    const barWidth = (tx.amount / maxAmount) * 100;
                    const label = tx.categoryName || cat?.displayName || tx.description || tx.note || "-";
                    return (
                      <div key={tx.tranactionId} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm w-5 text-center shrink-0">
                              {idx < 3 ? medals[idx] : <span className="text-xs text-muted-foreground font-bold">#{idx + 1}</span>}
                            </span>
                            <span className="text-sm">{cat?.icon || "📁"}</span>
                            <span className="text-xs truncate">{label}</span>
                          </div>
                          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                            -{formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                        <div className="ml-7 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              background: idx === 0 ? "#f43f5e" : idx === 1 ? "#fb923c" : idx === 2 ? "#fbbf24" : "#94a3b8",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("reports.monthlyBreakdown" as any)}</CardTitle>
          <CardDescription className="text-xs">{t("reports.monthlyBreakdownDesc" as any)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-accent">
                <TableHead className="font-semibold">{t("reports.month" as any)}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.totalIncome")}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.totalExpense")}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.totalSaving")}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.totalInvestment")}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.netBalance" as any)}</TableHead>
                <TableHead className="font-semibold text-center">{t("reports.trend" as any)}</TableHead>
                <TableHead className="font-semibold text-right">{t("reports.transactions" as any)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((m, idx) => {
                const monthIdx = parseInt(m.period.split("-")[1], 10) - 1;
                const net = m.income - m.expense - m.saving - m.investment;
                const prevNet = idx > 0
                  ? monthlyData[idx - 1].income - monthlyData[idx - 1].expense - monthlyData[idx - 1].saving - monthlyData[idx - 1].investment
                  : null;
                const netDiff = prevNet !== null ? net - prevNet : null;
                return (
                  <TableRow key={m.period}>
                    <TableCell className="font-medium">{t(monthKeys[monthIdx])}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                      {m.income > 0 ? `+${formatCurrency(m.income, currency)}` : formatCurrency(0, currency)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">
                      {m.expense > 0 ? `-${formatCurrency(m.expense, currency)}` : formatCurrency(0, currency)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(m.saving, currency)}
                    </TableCell>
                    <TableCell className="text-right text-purple-600 dark:text-purple-400">
                      {formatCurrency(m.investment, currency)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {net >= 0 ? "+" : ""}{formatCurrency(net, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      {netDiff === null ? (
                        <Minus className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                      ) : netDiff > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          <ArrowUpRight className="h-3 w-3" />
                          {prevNet !== 0 ? `${Math.abs((netDiff / Math.abs(prevNet!)) * 100).toFixed(0)}%` : ""}
                        </span>
                      ) : netDiff < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                          <ArrowDownRight className="h-3 w-3" />
                          {prevNet !== 0 ? `${Math.abs((netDiff / Math.abs(prevNet!)) * 100).toFixed(0)}%` : ""}
                        </span>
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{m.transactionCount}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell className="font-bold">{t("reports.total" as any)}</TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                  +{formatCurrency(totals.income, currency)}
                </TableCell>
                <TableCell className="text-right text-rose-600 dark:text-rose-400 font-bold">
                  -{formatCurrency(totals.expense, currency)}
                </TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400 font-bold">
                  {formatCurrency(totals.saving, currency)}
                </TableCell>
                <TableCell className="text-right text-purple-600 dark:text-purple-400 font-bold">
                  {formatCurrency(totals.investment, currency)}
                </TableCell>
                <TableCell className={`text-right font-bold ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance, currency)}
                </TableCell>
                <TableCell />
                <TableCell className="text-right text-muted-foreground font-bold">{totals.transactionCount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Breakdown + Transactions */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("reports.categoryBreakdown" as any)}</CardTitle>
              <CardDescription className="text-xs">{t("reports.categoryBreakdownDesc" as any)}</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("reports.noData")}</p>
              ) : (
                <>
                  {/* Half-Donut Pie Chart */}
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[280px] -mb-6">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={2}
                            strokeWidth={0}
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              fontSize: 12,
                              border: "1px solid hsl(var(--border))",
                              background: "hsl(var(--card))",
                              color: "hsl(var(--foreground))",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value: number, name: string) => [
                              formatCurrency(value, currency),
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-2">
                      <span className="text-[10px] text-muted-foreground">{t("reports.total" as any)}</span>
                      <p className="text-lg font-bold">{formatCurrency(totals.expense, currency)}</p>
                    </div>
                  </div>
                  {/* Category legend list */}
                  <div className="space-y-2.5 mt-4">
                    {categoryBreakdown.slice(0, 8).map((cat, i) => {
                      const catInfo = catMap.get(cat.categoryId);
                      return (
                        <div key={cat.categoryId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: RADIAL_COLORS[i % RADIAL_COLORS.length] }}
                            />
                            <span className="text-base shrink-0">{catInfo?.icon || "📁"}</span>
                            <span className="text-xs truncate">{cat.categoryName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground w-9 text-right">
                              {Math.round(cat.percentage)}%
                            </span>
                            <span className="text-xs font-semibold w-24 text-right">
                              {formatCurrency(cat.amount, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("reports.transactionList" as any)}</CardTitle>
              <CardDescription className="text-xs">
                {t("reports.transactionListDesc" as any)} ({transactions.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("reports.noData")}</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent">
                        <TableHead className="font-semibold">{t("reports.date" as any)}</TableHead>
                        <TableHead className="font-semibold">{t("reports.category" as any)}</TableHead>
                        <TableHead className="font-semibold">{t("reports.type" as any)}</TableHead>
                        <TableHead className="font-semibold">{t("reports.descriptionCol" as any)}</TableHead>
                        <TableHead className="font-semibold text-right">{t("reports.amount" as any)}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => {
                        const cat = catMap.get(tx.categoryId);
                        const isIncome = tx.type === 0;
                        const categoryLabel =
                          tx.categoryName?.trim() ||
                          cat?.displayName?.trim() ||
                          t("transactions.table.unknownCategory");
                        return (
                          <TableRow key={tx.tranactionId}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(tx.tranactionDate), "MMM dd")}
                            </TableCell>
                            <TableCell className="min-w-0 max-w-[220px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="text-sm shrink-0"
                                  style={cat?.color ? { color: cat.color } : undefined}
                                >
                                  {cat?.icon || "📁"}
                                </span>
                                <span className="truncate text-xs font-medium text-foreground">
                                  {categoryLabel}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[tx.type] || ""}`}>
                                {TransactionTypeMap[tx.type] || "Other"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {tx.description || tx.note || "-"}
                            </TableCell>
                            <TableCell className={`text-right text-sm font-medium ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {isIncome ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
