import type { MonthlyAggregation, ExpenseBreakdown } from "./aggregation";
import type { BudgetMonthlyResponse } from "./budget";
import type { InvestmentDashboard } from "./investment";
import type { SavingDashboard } from "./savings";
import type { Transaction } from "./transaction";
import type { RecurringPayment } from "./recurringPayment";

export interface DashboardResponse {
  currentMonth: MonthlyAggregation | null;
  monthlyTrend: MonthlyAggregation[];
  expenseBreakdown: ExpenseBreakdown;
  recentTransactions: Transaction[];
  budget: BudgetMonthlyResponse | null;
  savings: SavingDashboard;
  investment: InvestmentDashboard;
  upcomingBills: RecurringPayment[];
}
