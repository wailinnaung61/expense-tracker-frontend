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
