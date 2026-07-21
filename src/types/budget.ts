export interface BudgetMonthlyResponse {
  summary: BudgetSummaryDto;
  categories: BudgetCategoryDto[];
  topSpending: TopSpendingDto[];
  budgetId: string | null;
  /** Inclusive period (yyyy-MM-dd) from GET-by-month when a budget exists. */
  startDate: string;
  endDate: string;
  periodType?: string | null;
}

export interface BudgetSummaryDto {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  /** Unspent amount held for reserved (fixed) categories. */
  reservedRemaining: number;
  /** Freely spendable money after reserved unspent is held back. */
  spendableRemaining: number;
  /** Backend: spendableRemaining / remainingDays — do not recalculate client-side. */
  dailyBudget: number;
  usagePercent: number;
}

export interface BudgetCategoryDto {
  budgetCategoryId: string;
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  allocated: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  status: string;
  alertThreshold: number;
  sortOrder: number;
  /** When true, unspent allocation is reserved and excluded from daily/spendable. */
  isReserved: boolean;
  /** When false, skip budget threshold/exceeded notifications for this category. */
  alertsEnabled: boolean;
}

export interface TopSpendingDto {
  name: string;
  percent: number;
}

export interface BudgetDto {
  budgetId: string;
  periodType: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface CreateBudgetCategoryRequest {
  categoryId: string;
  allocatedAmount: number;
  alertThreshold: number;
  sortOrder: number;
  isReserved?: boolean;
  alertsEnabled?: boolean;
}

export interface CreateBudgetRequest {
  year: number;
  month: number;
  totalAmount: number;
  /** ISO yyyy-MM-dd; optional custom range (backend may set PeriodType Custom). */
  startDate?: string;
  endDate?: string;
  categories?: CreateBudgetCategoryRequest[];
}

export interface UpdateBudgetRequest {
  totalAmount: number;
}

export interface UpdateBudgetCategoryRequest {
  allocatedAmount: number;
  alertThreshold?: number;
  isReserved?: boolean;
  alertsEnabled?: boolean;
}

export interface MessageResponse {
  message: string;
}

/** Response from POST /api/budgets/{budgetId}/reports/excel (camelCase or PascalCase from API). */
export interface BudgetExcelExportJobResponse {
  jobId: string;
  status?: string;
  fileName?: string | null;
}

export function normalizeAlertThresholdPercent(
  alertThreshold: number,
  allocatedAmount: number
): number {
  if (!Number.isFinite(alertThreshold)) {
    return 80;
  }

  if (alertThreshold >= 0 && alertThreshold <= 1) {
    return Number((alertThreshold * 100).toFixed(0));
  }

  if (alertThreshold > 1 && alertThreshold <= 100) {
    return Number(alertThreshold.toFixed(0));
  }

  if (allocatedAmount > 0 && alertThreshold > 100 && alertThreshold <= allocatedAmount) {
    return Number(((alertThreshold / allocatedAmount) * 100).toFixed(0));
  }

  return 80;
}

export function toAlertThresholdRatio(alertThresholdPercent: number): number {
  const clampedPercent = Math.min(100, Math.max(0, alertThresholdPercent));
  return Number((clampedPercent / 100).toFixed(2));
}