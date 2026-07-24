import { DashboardHeader, type DashboardMode } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { ExpenseBreakdownCard } from "@/components/dashboard/ExpenseBreakdownCard";
import { BudgetSnapshot } from "@/components/dashboard/BudgetSnapshot";
import { SavingsSnapshot } from "@/components/dashboard/SavingsSnapshot";
import { InvestmentSnapshot } from "@/components/dashboard/InvestmentSnapshot";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { UpcomingBillsCard } from "@/components/dashboard/UpcomingBillsCard";
import { TodaySpentCard } from "@/components/dashboard/TodaySpentCard";
import { dashboardService } from "@/services/dashboardService";
import { profileService } from "@/services/profileService";
import { categoryService } from "@/services/categoryService";
import type { DashboardResponse } from "@/types/dashboard";
import type { ProfileResponse } from "@/types/profile";
import type { ExpenseCategory } from "@/types/category";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, subMonths, addMonths } from "date-fns";
import spinnerGif from "@/assets/Spinner.gif";
import { toast } from "react-toastify";
import { useTranslation } from "@/hooks/useTranslation";
import {
  CHATBOT_REFRESH_EVENT,
  type ChatbotRefreshEventDetail,
} from "@/lib/chatbot-refresh";

export default function Home() {
  const { t } = useTranslation();

  const [mode, setMode] = useState<DashboardMode>("monthly");
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const today = format(new Date(), "yyyy-MM-dd");
  const oneMonthAgo = format(subMonths(new Date(), 1), "yyyy-MM-dd");
  const [customStart, setCustomStart] = useState(oneMonthAgo);
  const [customEnd, setCustomEnd] = useState(today);
  const [appliedStart, setAppliedStart] = useState("");
  const [appliedEnd, setAppliedEnd] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRefreshKey, setTodayRefreshKey] = useState(0);

  const profileRef = useRef(profile);
  profileRef.current = profile;
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const currency = profile?.currency || "USD";

  const fetchMonthly = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const cachedProfile = profileRef.current;
      const cachedCategories = categoriesRef.current;

      const [dashRes, profRes, catRes] = await Promise.all([
        dashboardService.getDashboard(m),
        cachedProfile ? Promise.resolve(cachedProfile) : profileService.getProfile(),
        cachedCategories.length > 0
          ? Promise.resolve({ items: cachedCategories })
          : categoryService.getCategories({ pageSize: 100 }),
      ]);
      setData(dashRes);
      if (!cachedProfile) setProfile(profRes);
      if (cachedCategories.length === 0) setCategories(catRes.items);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error(t("errors.dashboardLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchCustomRange = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const cachedProfile = profileRef.current;
      const cachedCategories = categoriesRef.current;

      const [dashRes, profRes, catRes] = await Promise.all([
        dashboardService.getDashboardByRange(start, end),
        cachedProfile ? Promise.resolve(cachedProfile) : profileService.getProfile(),
        cachedCategories.length > 0
          ? Promise.resolve({ items: cachedCategories })
          : categoryService.getCategories({ pageSize: 100 }),
      ]);
      setData(dashRes);
      if (!cachedProfile) setProfile(profRes);
      if (cachedCategories.length === 0) setCategories(catRes.items);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error(t("errors.dashboardLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const queryRef = useRef({ mode, month, appliedStart, appliedEnd });
  queryRef.current = { mode, month, appliedStart, appliedEnd };

  useEffect(() => {
    fetchMonthly(month);
  }, [month, fetchMonthly]);

  const handleModeChange = useCallback((newMode: DashboardMode) => {
    setMode(newMode);
    setCustomError(null);
    if (newMode === "monthly") {
      fetchMonthly(month);
    }
  }, [fetchMonthly, month]);

  const handleApplyCustom = useCallback(() => {
    setCustomError(null);
    if (!customStart || !customEnd) {
      setCustomError(t("dashboard.customDateRequired"));
      return;
    }
    if (customStart > customEnd) {
      setCustomError(t("dashboard.customDateInvalid"));
      return;
    }
    const start = new Date(customStart);
    const maxEnd = addMonths(start, 24);
    if (new Date(customEnd) > maxEnd) {
      setCustomError(t("dashboard.customDateMax24"));
      return;
    }
    setAppliedStart(customStart);
    setAppliedEnd(customEnd);
    fetchCustomRange(customStart, customEnd);
  }, [customStart, customEnd, fetchCustomRange, t]);

  const handleMonthChange = useCallback((m: string) => setMonth(m), []);

  const handleRefresh = useCallback(() => {
    setTodayRefreshKey((k) => k + 1);
    if (mode === "custom" && appliedStart && appliedEnd) {
      fetchCustomRange(appliedStart, appliedEnd);
    } else {
      fetchMonthly(month);
    }
  }, [mode, month, appliedStart, appliedEnd, fetchMonthly, fetchCustomRange]);

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
          setTodayRefreshKey((k) => k + 1);
          const q = queryRef.current;
        if (q.mode === "custom" && q.appliedStart && q.appliedEnd) {
          fetchCustomRange(q.appliedStart, q.appliedEnd);
        } else {
          fetchMonthly(q.month);
        }
      }
    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, [fetchMonthly, fetchCustomRange]);

  const previousMonth = useMemo(() => data?.monthlyTrend
    .filter((m) => m.period < (data.currentMonth?.period ?? ""))
    .sort((a, b) => b.period.localeCompare(a.period))[0] ?? null, [data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 mx-auto">
      <DashboardHeader
        month={month}
        onMonthChange={handleMonthChange}
        onRefresh={handleRefresh}
        loading={loading}
        mode={mode}
        onModeChange={handleModeChange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        onApplyCustom={handleApplyCustom}
        customError={customError}
      />

      <TodaySpentCard
        currency={currency}
        dailyLimit={profile?.dailyLimit ?? 0}
        dailyBudget={data.budget?.summary?.dailyBudget ?? 0}
        refreshKey={todayRefreshKey}
      />

      <SummaryCards
        current={data.currentMonth}
        previous={previousMonth}
        currency={currency}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <MonthlyTrendChart currency={currency} month={mode === "monthly" ? month : undefined} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ExpenseBreakdownCard breakdown={data.expenseBreakdown} currency={currency} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <BudgetSnapshot budget={data.budget} currency={currency} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <RecentTransactionsCard transactions={data.recentTransactions} categories={categories} currency={currency} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <UpcomingBillsCard bills={data.upcomingBills} currency={currency} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <SavingsSnapshot savings={data.savings} currency={currency} />
        </div>
        <div className="col-span-12 md:col-span-6">
          <InvestmentSnapshot investment={data.investment} currency={currency} />
        </div>
      </div>
    </div>
  );
}
