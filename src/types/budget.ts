export interface BudgetMonthlyResponse {
  summary: BudgetSummaryDto;
  categories: BudgetCategoryDto[];
  topSpending: TopSpendingDto[];
  budgetId: string | null;
}

export interface BudgetSummaryDto {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
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
}

export interface CreateBudgetRequest {
  year: number;
  month: number;
  totalAmount: number;
  categories?: CreateBudgetCategoryRequest[];
}

export interface UpdateBudgetRequest {
  totalAmount: number;
}

export interface UpdateBudgetCategoryRequest {
  allocatedAmount: number;
  alertThreshold?: number;
}

export interface MessageResponse {
  message: string;
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