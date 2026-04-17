import type { BudgetMonthlyResponse } from "@/types/budget";
import { endOfMonth, format, parseISO } from "date-fns";
import type { Locale } from "date-fns";
import { enUS, ja } from "date-fns/locale";

export function monthBoundsFromYyyyMm(ym: string): { start: string; end: string } {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    const d = new Date();
    const ys = d.getFullYear();
    const ms = d.getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `${ys}-${pad(ms)}-01`;
    const end = format(endOfMonth(new Date(ys, ms - 1, 1)), "yyyy-MM-dd");
    return { start, end };
  }
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const end = format(endOfMonth(new Date(y, m - 1, 1)), "yyyy-MM-dd");
  return { start, end };
}

/**
 * Spread sample days across a calendar month (plus first/last) for GET /api/budgets/containing.
 * Used to discover multiple non-overlapping budget periods that touch the same month.
 */
export function budgetProbeDatesForCalendarMonth(ym: string): string[] {
  const { end } = monthBoundsFromYyyyMm(ym);
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return [format(new Date(), "yyyy-MM-dd")];
  }
  const lastDay = parseInt(end.slice(8, 10), 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  const prefix = `${y}-${pad(m)}-`;
  const daySet = new Set<number>();
  daySet.add(1);
  daySet.add(lastDay);
  for (let i = 0; i < 8; i++) {
    const day = Math.min(lastDay, Math.max(1, Math.round(1 + (i * (lastDay - 1)) / 7)));
    daySet.add(day);
  }
  return [...daySet].sort((a, b) => a - b).map((d) => `${prefix}${pad(d)}`);
}

export function isSameCalendarMonthRange(startDate: string, endDate: string, ym: string): boolean {
  const { start, end } = monthBoundsFromYyyyMm(ym);
  return startDate === start && endDate === end;
}

/** True if budget [rangeStart, rangeEnd] overlaps the calendar month of `ym` (yyyy-MM). */
export function calendarMonthOverlapsBudgetRange(
  ym: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  const { start: ms, end: me } = monthBoundsFromYyyyMm(ym);
  return rangeStart <= me && rangeEnd >= ms;
}

/** Budget starts and ends in different calendar months (e.g. Apr 15 – May 15). */
export function spansMultipleCalendarMonths(startISO: string, endISO: string): boolean {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return false;
  }
  return format(s, "yyyy-MM") !== format(e, "yyyy-MM");
}

/** Label for the month navigator only (e.g. "May 2026"). */
export function formatSelectedCalendarMonth(ym: string, locale: Locale): string {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return format(new Date(), "MMMM yyyy", { locale });
  }
  return format(new Date(y, m - 1, 1), "MMMM yyyy", { locale });
}

export function dateFnsLocaleForLanguage(code: string | undefined): Locale {
  if (code?.toLowerCase().startsWith("ja")) return ja;
  return enUS;
}

/**
 * Whether the calendar day of `transactionDate` lies in [budgetStart, budgetEnd] inclusive.
 * Arguments must be `yyyy-MM-dd` strings for the budget bounds (API convention).
 */
export function isTransactionDayInBudgetPeriod(
  transactionDate: Date,
  budgetStartYyyyMmDd: string,
  budgetEndYyyyMmDd: string
): boolean {
  const start = budgetStartYyyyMmDd.trim();
  const end = budgetEndYyyyMmDd.trim();
  if (!start || !end) return true;
  const day = format(transactionDate, "yyyy-MM-dd");
  return day >= start && day <= end;
}

/**
 * Date for GET /api/budgets/containing when navigating by calendar month.
 * Uses today for the current month so split pay cycles show the active period; otherwise the first
 * day of the month (aligned with earliest-overlap GET /api/budgets/{year}/{month}).
 */
export function representativeBudgetQueryDateForMonth(ym: string): string {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayYm = today.slice(0, 7);
  if (ym === todayYm) {
    return today;
  }
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) {
    return today;
  }
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

export function formatBudgetRangeLabel(
  startISO: string,
  endISO: string,
  locale: Locale
): string {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return `${startISO} – ${endISO}`;
  }
  if (format(s, "yyyy-MM") === format(e, "yyyy-MM")) {
    if (format(s, "d") === format(e, "d")) {
      return format(s, "PPP", { locale });
    }
    return `${format(s, "MMM d", { locale })} – ${format(e, "d, yyyy", { locale })}`;
  }
  return `${format(s, "MMM d, yyyy", { locale })} – ${format(e, "MMM d, yyyy", { locale })}`;
}

/** Dedupe probe results by budget id; keep earliest anchor per id; sort by period start. */
export function mergeCycleOptionsFromProbes(
  probeDates: string[],
  responses: (BudgetMonthlyResponse | null)[],
  locale: Locale
): Array<{
  anchorDate: string;
  budgetId: string;
  periodStart: string;
  rangeLabel: string;
}> {
  const byId = new Map<string, { anchorDate: string; res: BudgetMonthlyResponse }>();
  for (let i = 0; i < responses.length; i++) {
    const res = responses[i];
    const id = res?.budgetId?.trim();
    if (!id || !res) continue;
    const anchor = probeDates[i];
    const prev = byId.get(id);
    if (!prev || anchor < prev.anchorDate) {
      byId.set(id, { anchorDate: anchor, res });
    }
  }
  return Array.from(byId.values())
    .map(({ anchorDate, res }) => ({
      anchorDate,
      budgetId: res.budgetId!,
      periodStart: (res.startDate ?? "").trim() || anchorDate,
      rangeLabel: formatBudgetRangeLabel(res.startDate, res.endDate, locale),
    }))
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
}
