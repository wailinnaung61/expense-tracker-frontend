import type { BudgetDto, BudgetMonthlyResponse } from "@/types/budget";

function firstString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

/** Some APIs serialize with PascalCase; merge into camelCase fields the UI uses. */
export function normalizeBudgetMonthlyResponse(
  raw: BudgetMonthlyResponse
): BudgetMonthlyResponse {
  const r = raw as unknown as Record<string, unknown>;
  return {
    ...raw,
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
