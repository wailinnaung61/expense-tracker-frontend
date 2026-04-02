import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { ExpenseBreakdownCard } from "@/components/dashboard/ExpenseBreakdownCard";
import { BudgetSnapshot } from "@/components/dashboard/BudgetSnapshot";
import { SavingsSnapshot } from "@/components/dashboard/SavingsSnapshot";
import { InvestmentSnapshot } from "@/components/dashboard/InvestmentSnapshot";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { UpcomingBillsCard } from "@/components/dashboard/UpcomingBillsCard";
import { dashboardService } from "@/services/dashboardService";
import { profileService } from "@/services/profileService";
import { categoryService } from "@/services/categoryService";
import type { DashboardResponse } from "@/types/dashboard";
import type { ProfileResponse } from "@/types/profile";
import type { ExpenseCategory } from "@/types/category";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import spinnerGif from "@/assets/Spinner.gif";

export default function Home() {
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const currency = profile?.currency || "USD";

  const fetchData = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const [dashRes, profRes, catRes] = await Promise.all([
        dashboardService.getDashboard(m),
        profile ? Promise.resolve(profile) : profileService.getProfile(),
        categories.length > 0 ? Promise.resolve({ items: categories }) : categoryService.getCategories({ pageSize: 100 }),
      ]);
      setData(dashRes);
      if (!profile) setProfile(profRes);
      if (categories.length === 0) setCategories(catRes.items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [profile, categories]);

  useEffect(() => {
    fetchData(month);
  }, [month, fetchData]);

  const handleMonthChange = (m: string) => setMonth(m);
  const handleRefresh = () => fetchData(month);

  // Find previous month from trend data for comparison
  const previousMonth = data?.monthlyTrend
    .filter((m) => m.period < (data.currentMonth?.period ?? ""))
    .sort((a, b) => b.period.localeCompare(a.period))[0] ?? null;

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
      />

      {/* Summary Cards */}
      <SummaryCards
        current={data.currentMonth}
        previous={previousMonth}
        currency={currency}
      />

      {/* Row 2: Monthly Trend (wide) + Expense Breakdown (narrow) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <MonthlyTrendChart currency={currency} month={month} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ExpenseBreakdownCard breakdown={data.expenseBreakdown} currency={currency} />
        </div>
      </div>

      {/* Row 3: Budget + Recent Transactions + Upcoming Bills */}
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

      {/* Row 4: Savings + Investment */}
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
