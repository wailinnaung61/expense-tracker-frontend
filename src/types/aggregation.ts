// Aggregation API Types

export interface DailyAggregation {
  period: string; // YYYY-MM-DD
  income: number;
  expense: number;
  saving: number;
  investment: number;
  transactionCount: number;
}

export interface WeeklyAggregation {
  period: string; // YYYY-Www
  income: number;
  expense: number;
  saving: number;
  investment: number;
  transactionCount: number;
}

export interface MonthlyAggregation {
  period: string; // YYYY-MM
  periodStart: string;
  periodEnd: string;
  income: number;
  expense: number;
  saving: number;
  investment: number;
  transactionCount: number;
}

export interface YearlyAggregation {
  period: string; // YYYY
  income: number;
  expense: number;
  saving: number;
  investment: number;
  transactionCount: number;
}

export interface CategoryMonthlyAggregation {
  categoryId: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  transactionCount: number;
}

export interface ExpenseBreakdownCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface ExpenseBreakdownComparison {
  lastMonth: number;
  thisMonth: number;
  difference: number;
  percentageChange: number;
}

export interface ExpenseBreakdown {
  totalExpenses: number;
  categories: ExpenseBreakdownCategory[];
  comparison: ExpenseBreakdownComparison | null; // Backend: MonthlyComparison? (nullable)
}

export interface CustomDateAggregationResponse {
  summary: MonthlyAggregation;
  breakdown: ExpenseBreakdown;
}

// Type aliases for backend naming compatibility
export type CategoryBreakdownItem = ExpenseBreakdownCategory;
export type MonthlyComparison = ExpenseBreakdownComparison;
