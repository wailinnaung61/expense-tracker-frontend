import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { cn, formatCurrency } from "@/lib/utils";
import { transactionService } from "@/services/transactionService";
import { PaymentStatus, TransactionType } from "@/types/transaction";
import { format } from "date-fns";
import { AlertTriangle, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface TodaySpentCardProps {
  currency: string;
  /** Profile daily spending limit (preferred when > 0). */
  dailyLimit: number;
  /** Budget spendable daily amount — used when dailyLimit is 0. */
  dailyBudget?: number;
  /** Bump to refetch (e.g. after dashboard refresh). */
  refreshKey?: number;
}

async function fetchTodayExpenseTotal(): Promise<number> {
  const today = format(new Date(), "yyyy-MM-dd");
  let total = 0;
  let cursor: string | undefined;
  let cursorId: string | undefined;

  for (let page = 0; page < 8; page++) {
    const res = await transactionService.getTransactions({
      startDate: today,
      endDate: today,
      type: TransactionType.Expense,
      status: PaymentStatus.Completed,
      pageSize: 50,
      cursor,
      cursorId,
    });

    for (const tx of res.items ?? []) {
      const amount = Number(tx.amount);
      if (Number.isFinite(amount)) total += amount;
    }

    if (!res.hasNextPage || !res.nextCursor) break;
    cursor = res.nextCursor;
    cursorId = res.nextCursorId;
  }

  return total;
}

export function TodaySpentCard({
  currency,
  dailyLimit,
  dailyBudget = 0,
  refreshKey = 0,
}: TodaySpentCardProps) {
  const { t } = useTranslation();
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const total = await fetchTodayExpenseTotal();
      setSpent(total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const limit =
    dailyLimit > 0 ? dailyLimit : dailyBudget > 0 ? dailyBudget : 0;
  const limitKind: "dailyLimit" | "dailyBudget" | "none" =
    dailyLimit > 0 ? "dailyLimit" : dailyBudget > 0 ? "dailyBudget" : "none";

  const pct = limit > 0 ? Math.min(999, (spent / limit) * 100) : 0;
  const barPct = Math.min(100, pct);
  const remaining = limit > 0 ? Math.max(0, limit - spent) : 0;
  const over = limit > 0 && spent > limit;

  const tone =
    limit <= 0
      ? "neutral"
      : pct >= 100
        ? "danger"
        : pct >= 70
          ? "warn"
          : "ok";

  const toneStyles = {
    ok: {
      card: "border-emerald-200/80 bg-linear-to-br from-emerald-50/90 via-white to-sky-50/50 dark:border-emerald-900 dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-900",
      icon: "from-emerald-500 to-teal-600 text-white",
      amount: "text-emerald-700 dark:text-emerald-300",
      bar: "bg-emerald-500",
    },
    warn: {
      card: "border-amber-200/80 bg-linear-to-br from-amber-50/90 via-white to-orange-50/40 dark:border-amber-900 dark:from-amber-950/40 dark:via-slate-950 dark:to-slate-900",
      icon: "from-amber-500 to-orange-600 text-white",
      amount: "text-amber-700 dark:text-amber-300",
      bar: "bg-amber-500",
    },
    danger: {
      card: "border-rose-200/80 bg-linear-to-br from-rose-50/90 via-white to-red-50/40 dark:border-rose-900 dark:from-rose-950/40 dark:via-slate-950 dark:to-slate-900",
      icon: "from-rose-500 to-red-600 text-white",
      amount: "text-rose-700 dark:text-rose-300",
      bar: "bg-rose-500",
    },
    neutral: {
      card: "border-sky-200/70 bg-linear-to-br from-sky-50/80 via-white to-violet-50/40 dark:border-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
      icon: "from-sky-500 to-blue-600 text-white",
      amount: "text-slate-800 dark:text-slate-100",
      bar: "bg-sky-500",
    },
  }[tone];

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border shadow-sm",
        toneStyles.card
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br shadow-sm",
              toneStyles.icon
            )}
          >
            {tone === "danger" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-foreground">
                {t("dashboard.todaySpent")}
              </h2>
              <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("dashboard.today")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {limitKind === "dailyLimit"
                ? t("dashboard.todaySpentVsLimit")
                : limitKind === "dailyBudget"
                  ? t("dashboard.todaySpentVsBudget")
                  : t("dashboard.todaySpentHint")}
            </p>
          </div>
        </div>

        <div className="min-w-0 sm:text-right">
          {loading ? (
            <Skeleton className="ml-auto h-8 w-32" />
          ) : error ? (
            <p className="text-sm text-muted-foreground">
              {t("dashboard.todaySpentError")}
            </p>
          ) : (
            <>
              <p className={cn("text-2xl font-bold tracking-tight", toneStyles.amount)}>
                {formatCurrency(spent, currency)}
              </p>
              {limit > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {over
                    ? t("dashboard.todaySpentOver", {
                        amount: formatCurrency(spent - limit, currency),
                      })
                    : t("dashboard.todaySpentRemaining", {
                        amount: formatCurrency(remaining, currency),
                      })}
                  {" · "}
                  {Math.round(pct)}%
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {limit > 0 && !loading && !error && (
        <div className="space-y-2 border-t border-black/5 px-4 pb-4 pt-3 dark:border-white/10 sm:px-5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {t("dashboard.ofLimit", {
                amount: formatCurrency(limit, currency),
              })}
            </span>
            <Link
              to="/tranaction"
              className="font-medium text-primary hover:underline"
            >
              {t("dashboard.viewTransactions")}
            </Link>
          </div>
          <Progress
            value={barPct}
            className="h-2 bg-black/5 dark:bg-white/10"
            indicatorClassName={toneStyles.bar}
          />
        </div>
      )}

      {limit <= 0 && !loading && !error && (
        <div className="border-t border-black/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 sm:px-5">
          <Link to="/setting" className="font-medium text-primary hover:underline">
            {t("dashboard.setDailyLimit")}
          </Link>
          {" · "}
          <Link to="/tranaction" className="hover:underline">
            {t("dashboard.viewTransactions")}
          </Link>
        </div>
      )}
    </Card>
  );
}
