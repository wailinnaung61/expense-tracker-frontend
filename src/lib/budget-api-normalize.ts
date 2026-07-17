import type {
  BudgetCategoryDto,
  BudgetDto,
  BudgetMonthlyResponse,
  BudgetSummaryDto,
} from "@/types/budget";

function firstString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function normalizeSummary(raw: BudgetSummaryDto | undefined): BudgetSummaryDto {
  const s = (raw ?? {}) as unknown as Record<string, unknown>;
  return {
    totalBudget: asNumber(raw?.totalBudget ?? s.TotalBudget),
    totalSpent: asNumber(raw?.totalSpent ?? s.TotalSpent),
    remaining: asNumber(raw?.remaining ?? s.Remaining),
    reservedRemaining: asNumber(
      raw?.reservedRemaining ?? s.reservedRemaining ?? s.ReservedRemaining
    ),
    spendableRemaining: asNumber(
      raw?.spendableRemaining ?? s.spendableRemaining ?? s.SpendableRemaining,
      asNumber(raw?.remaining ?? s.Remaining)
    ),
    dailyBudget: asNumber(raw?.dailyBudget ?? s.DailyBudget),
    usagePercent: asNumber(raw?.usagePercent ?? s.UsagePercent),
  };
}

function normalizeCategory(raw: BudgetCategoryDto): BudgetCategoryDto {
  const r = raw as unknown as Record<string, unknown>;
  return {
    ...raw,
    isReserved: asBoolean(raw.isReserved ?? r.IsReserved, false),
  };
}

/** Some APIs serialize with PascalCase; merge into camelCase fields the UI uses. */
export function normalizeBudgetMonthlyResponse(
  raw: BudgetMonthlyResponse
): BudgetMonthlyResponse {
  const r = raw as unknown as Record<string, unknown>;
  return {
    ...raw,
    summary: normalizeSummary(raw.summary),
    categories: (raw.categories ?? []).map(normalizeCategory),
    startDate: firstString(raw.startDate, r.startDate, r.StartDate) ?? "",
    endDate: firstString(raw.endDate, r.endDate, r.EndDate) ?? "",
    periodType: firstString(raw.periodType, r.periodType, r.PeriodType) ?? raw.periodType ?? null,
  };
}

export function normalizeBudgetDto(raw: BudgetDto): BudgetDto {
  const r = raw as unknown as Record<string, unknown>;
  return {
    ...raw,
    startDate: firstString(raw.startDate, r.startDate, r.StartDate) ?? raw.startDate,
    endDate: firstString(raw.endDate, r.endDate, r.EndDate) ?? raw.endDate,
    periodType: firstString(raw.periodType, r.periodType, r.PeriodType) ?? raw.periodType,
  };
}
