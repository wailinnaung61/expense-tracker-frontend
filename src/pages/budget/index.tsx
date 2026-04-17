import { BudgetCategories } from "@/components/budget/budget-categories";
import { BudgetFormDialog } from "@/components/budget/budget-form-dialog";
import { BudgetHeader, type BudgetCycleSplitOption } from "@/components/budget/budget-header";
import { BudgetSummary } from "@/components/budget/budget-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api";
import {
  calendarMonthOverlapsBudgetRange,
  dateFnsLocaleForLanguage,
  formatBudgetRangeLabel,
  budgetProbeDatesForCalendarMonth,
  formatSelectedCalendarMonth,
  isSameCalendarMonthRange,
  mergeCycleOptionsFromProbes,
  monthBoundsFromYyyyMm,
  representativeBudgetQueryDateForMonth,
  spansMultipleCalendarMonths,
} from "@/lib/budget-period";
import { budgetService } from "@/services/budgetService";
import { categoryService } from "@/services/categoryService";
import { profileService } from "@/services/profileService";
import {
  toAlertThresholdRatio,
  type BudgetDto,
  type BudgetMonthlyResponse,
} from "@/types/budget";
import { TransactionType, type ExpenseCategory } from "@/types/category";
import type { ProfileResponse } from "@/types/profile";
import { format } from "date-fns";
import { AlertTriangle, Loader2, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  CHATBOT_REFRESH_EVENT,
  type ChatbotRefreshEventDetail,
} from "@/lib/chatbot-refresh";

function createFallbackBudgetMeta(
  budget: BudgetMonthlyResponse | null,
  selectedMonth: string
): BudgetDto | null {
  if (!budget?.budgetId) {
    return null;
  }

  const { start: monthStart, end: monthEnd } = monthBoundsFromYyyyMm(selectedMonth);
  const startDate = budget.startDate?.trim() ? budget.startDate : monthStart;
  const endDate = budget.endDate?.trim() ? budget.endDate : monthEnd;
  const inferredCustom = !isSameCalendarMonthRange(startDate, endDate, selectedMonth);
  const periodType = budget.periodType ?? (inferredCustom ? "CUSTOM" : "MONTHLY");

  return {
    budgetId: budget.budgetId,
    periodType,
    startDate,
    endDate,
    totalAmount: budget.summary.totalBudget,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
}

function dedupeCategories(categories: ExpenseCategory[]) {
  const seen = new Map<string, ExpenseCategory>();

  categories.forEach((category) => {
    const existing = seen.get(category.categoryId);
    if (
      !existing ||
      (category.updatedAt && existing.updatedAt && category.updatedAt > existing.updatedAt) ||
      (category.updatedAt && !existing.updatedAt)
    ) {
      seen.set(category.categoryId, category);
    }
  });

  return Array.from(seen.values());
}

export default function Budget() {
  const { t, i18n } = useTranslation();
  const initialMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [budgetAsOfDate, setBudgetAsOfDate] = useState(() =>
    representativeBudgetQueryDateForMonth(initialMonth)
  );
  const [cycleSplitOptions, setCycleSplitOptions] = useState<BudgetCycleSplitOption[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [budget, setBudget] = useState<BudgetMonthlyResponse | null>(null);
  const [budgetMeta, setBudgetMeta] = useState<BudgetDto | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [removingCategoryId, setRemovingCategoryId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"reset" | "delete" | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const hasBudget = Boolean(budget?.budgetId);

  const { periodBadge, headingDescription } = useMemo(() => {
    const locale = dateFnsLocaleForLanguage(i18n.language);
    const monthNav = formatSelectedCalendarMonth(selectedMonth, locale);
    const rs = budget?.startDate?.trim();
    const re = budget?.endDate?.trim();
    const ms = budgetMeta?.startDate?.trim();
    const me = budgetMeta?.endDate?.trim();
    const fromResponse = rs && re ? { start: rs, end: re } : null;
    const fromMeta = ms && me ? { start: ms, end: me } : null;
    const bounds = fromResponse ?? fromMeta;

    if (!hasBudget || !bounds?.start || !bounds?.end) {
      return {
        periodBadge: monthNav,
        headingDescription: t("budget.header.browseHint", { monthNav } as any),
      };
    }

    const rangeStr = formatBudgetRangeLabel(bounds.start, bounds.end, locale);
    const spansMulti = spansMultipleCalendarMonths(bounds.start, bounds.end);

    if (spansMulti) {
      return {
        periodBadge: t("budget.header.badgeCrossMonth", { budgetRange: rangeStr } as any),
        headingDescription: t("budget.header.subtitleCrossMonth", {
          monthNav,
          budgetRange: rangeStr,
        } as any),
      };
    }

    return {
      periodBadge: t("budget.header.badgeInMonth", { monthNav, budgetRange: rangeStr } as any),
      headingDescription: t("budget.header.subtitleSingleMonth", {
        monthNav,
        budgetRange: rangeStr,
      } as any),
    };
  }, [budget, budgetMeta, selectedMonth, hasBudget, i18n.language, t]);

  const effectiveBudgetMeta = budgetMeta ?? createFallbackBudgetMeta(budget, selectedMonth);
  const currency = profile?.currency || "USD";
  const profileDailyLimit = profile?.dailyLimit ?? 0;
  const hasHiddenCategories = useMemo(() => {
    const budgetCategoryIds = new Set((budget?.categories || []).map((item) => item.categoryId));
    return expenseCategories.some((category) => !budgetCategoryIds.has(category.categoryId));
  }, [budget?.categories, expenseCategories]);

  const loadReferenceData = useCallback(async () => {
    setIsPageLoading(true);
    setPageError(null);

    try {
      const [profileResponse, categoriesResponse] = await Promise.all([
        profileService.getProfile(),
        categoryService.getCategories({
          type: String(TransactionType.Expense),
          pageSize: 999999,
        }),
      ]);

      setProfile(profileResponse);
      setExpenseCategories(dedupeCategories(categoriesResponse.items || []));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("budget.feedback.loadFailed");
      setPageError(message);
    } finally {
      setIsPageLoading(false);
    }
  }, [t]);

  const loadBudgetForMonth = useCallback(async (ym: string, asOfDate: string) => {
    setIsBudgetLoading(true);
    setBudgetError(null);
    const locale = dateFnsLocaleForLanguage(i18n.language);
    try {
      const probeDates = budgetProbeDatesForCalendarMonth(ym);
      const probeResults = await Promise.all(
        probeDates.map((d) => budgetService.getBudgetContainingDateOrNull(d))
      );
      let cycleOpts = mergeCycleOptionsFromProbes(probeDates, probeResults, locale);

      const response = await budgetService.getBudgetContainingDate(asOfDate);
      const mainId = response.budgetId?.trim();
      if (
        mainId &&
        !cycleOpts.some((o) => o.budgetId === mainId) &&
        response.startDate &&
        response.endDate
      ) {
        cycleOpts = [
          ...cycleOpts,
          {
            anchorDate: asOfDate,
            budgetId: mainId,
            periodStart: response.startDate.trim() || asOfDate,
            rangeLabel: formatBudgetRangeLabel(response.startDate, response.endDate, locale),
          },
        ].sort((a, b) => a.periodStart.localeCompare(b.periodStart));
      }

      setCycleSplitOptions(cycleOpts.length > 1 ? cycleOpts : []);
      setBudget(response);
      setBudgetMeta((prev) => {
        if (!response.budgetId) {
          return prev;
        }
        const { start: fbStart, end: fbEnd } = monthBoundsFromYyyyMm(ym);
        const same = prev?.budgetId === response.budgetId;
        const fromApiStart = response.startDate?.trim() || undefined;
        const fromApiEnd = response.endDate?.trim() || undefined;
        const canCarryPrev =
          same &&
          prev &&
          prev.startDate &&
          prev.endDate &&
          calendarMonthOverlapsBudgetRange(ym, prev.startDate, prev.endDate);
        const startDate =
          fromApiStart && fromApiEnd
            ? fromApiStart
            : canCarryPrev
              ? prev.startDate
              : fbStart;
        const endDate =
          fromApiStart && fromApiEnd
            ? fromApiEnd
            : canCarryPrev
              ? prev.endDate
              : fbEnd;
        return {
          budgetId: response.budgetId,
          periodType:
            response.periodType ??
            (same && prev ? prev.periodType : "MONTHLY"),
          startDate,
          endDate,
          totalAmount: response.summary.totalBudget,
          status: same && prev ? prev.status : "ACTIVE",
          createdAt: same && prev ? prev.createdAt : new Date().toISOString(),
        };
      });
    } catch (error) {
      setCycleSplitOptions([]);
      if (error instanceof ApiError && error.status === 404) {
        setBudget(null);
        setBudgetMeta(null);
      } else {
        const message =
          error instanceof Error ? error.message : t("budget.feedback.loadFailed");
        setBudgetError(message);
      }
    } finally {
      setIsBudgetLoading(false);
    }
  }, [t, i18n.language]);

  const loadBudget = useCallback(
    () => loadBudgetForMonth(selectedMonth, budgetAsOfDate),
    [loadBudgetForMonth, selectedMonth, budgetAsOfDate]
  );

  const handleMonthChange = useCallback((ym: string) => {
    setSelectedMonth(ym);
    setBudgetAsOfDate(representativeBudgetQueryDateForMonth(ym));
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    void loadBudget();
  }, [loadBudget]);

  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const { target } = (event as CustomEvent<ChatbotRefreshEventDetail>).detail;
      if (target === "budget") {
        void loadBudget();
      }
    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, [loadBudget]);

  const handleCreate = async (request: Parameters<typeof budgetService.createBudget>[0]) => {
    setIsDialogSubmitting(true);
    try {
      const created = await budgetService.createBudget(request);
      setBudgetMeta(created);
      setDialogOpen(false);
      if (created.startDate?.length >= 7) {
        const ym = created.startDate.slice(0, 7);
        const asOf = representativeBudgetQueryDateForMonth(ym);
        setSelectedMonth(ym);
        setBudgetAsOfDate(asOf);
        await loadBudgetForMonth(ym, asOf);
      } else {
        await loadBudget();
      }
      toast.success(t("budget.feedback.created"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.createFailed"));
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleUpdate = async (request: Parameters<typeof budgetService.updateBudget>[1]) => {
    if (!effectiveBudgetMeta?.budgetId) {
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const updated = await budgetService.updateBudget(effectiveBudgetMeta.budgetId, request);
      setBudgetMeta(updated);
      setDialogOpen(false);
      await loadBudget();
      toast.success(t("budget.feedback.updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.updateFailed"));
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleSaveCategory = async (
    budgetCategoryId: string,
    values: { allocatedAmount: number; alertThresholdPercent: number }
  ) => {
    setSavingCategoryId(budgetCategoryId);
    try {
      await budgetService.updateBudgetCategory(budgetCategoryId, {
        allocatedAmount: values.allocatedAmount,
        alertThreshold: toAlertThresholdRatio(values.alertThresholdPercent),
      });
      await loadBudget();
      toast.success(t("budget.feedback.categoryUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("budget.feedback.categoryUpdateFailed")
      );
    } finally {
      setSavingCategoryId(null);
    }
  };

  const handleAddCategory = async (categoryId: string, allocatedAmount: number) => {
    if (!budget?.budgetId) return false;
    try {
      await budgetService.addBudgetCategory(budget.budgetId, {
        categoryId,
        allocatedAmount,
        alertThreshold: 0.8,
        sortOrder: 0,
      });
      await loadBudget();
      toast.success(t("budget.feedback.categoryAdded"));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.categoryAddFailed"));
      return false;
    }
  };

  const handleRemoveCategory = async (budgetCategoryId: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("budget.feedback.confirmRemoveCategoryTitle"),
      text: t("budget.feedback.confirmRemoveCategoryText"),
      showCancelButton: true,
      confirmButtonText: t("budget.feedback.confirmButton"),
      cancelButtonText: t("budget.feedback.cancelButton"),
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    setRemovingCategoryId(budgetCategoryId);
    try {
      await budgetService.removeBudgetCategory(budgetCategoryId);
      await loadBudget();
      toast.success(t("budget.feedback.categoryRemoved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.categoryRemoveFailed"));
    } finally {
      setRemovingCategoryId(null);
    }
  };

  const handleExportBudgetExcel = useCallback(async () => {
    const budgetId = budget?.budgetId;
    if (!budgetId) {
      return;
    }
    setIsExportingExcel(true);
    try {
      await toast.promise(budgetService.downloadBudgetExcelReport(budgetId), {
        pending: t("budget.header.exportingExcel"),
        success: t("budget.feedback.excelExportSuccess"),
        error: {
          render({ data }: { data?: unknown }) {
            return data instanceof Error ? data.message : t("budget.feedback.excelExportFailed");
          },
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingExcel(false);
    }
  }, [budget?.budgetId, t]);

  const handleReset = async () => {
    if (!budget?.budgetId) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: t("budget.feedback.confirmResetTitle"),
      text: t("budget.feedback.confirmResetText"),
      showCancelButton: true,
      confirmButtonText: t("budget.feedback.confirmButton"),
      cancelButtonText: t("budget.feedback.cancelButton"),
    });

    if (!result.isConfirmed) {
      return;
    }

    setActionLoading("reset");
    try {
      await budgetService.resetBudget(budget.budgetId);
      await loadBudget();
      toast.success(t("budget.feedback.resetSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.resetFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!budget?.budgetId) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: t("budget.feedback.confirmDeleteTitle"),
      text: t("budget.feedback.confirmDeleteText"),
      showCancelButton: true,
      confirmButtonText: t("budget.feedback.confirmButton"),
      cancelButtonText: t("budget.feedback.cancelButton"),
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    setActionLoading("delete");
    try {
      await budgetService.deleteBudget(budget.budgetId);
      setBudget(null);
      setBudgetMeta(null);
      toast.success(t("budget.feedback.deleteSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.deleteFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
        <Button onClick={() => void loadReferenceData()}>{t("budget.header.refresh")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHeader
        selectedMonth={selectedMonth}
        periodLabel={periodBadge}
        headingDescription={headingDescription}
        hasBudget={hasBudget}
        budgetStatus={effectiveBudgetMeta?.status}
        isBusy={isBudgetLoading || isDialogSubmitting || actionLoading !== null || isExportingExcel}
        isExportingExcel={isExportingExcel}
        onBudgetAsOfDateChange={setBudgetAsOfDate}
        cycleSplitOptions={cycleSplitOptions}
        activeBudgetId={budget?.budgetId ?? null}
        onMonthChange={handleMonthChange}
        onCreate={() => {
          setDialogMode("create");
          setDialogOpen(true);
        }}
        onEdit={() => {
          setDialogMode("edit");
          setDialogOpen(true);
        }}
        onRefresh={() => void loadBudget()}
        onReset={() => void handleReset()}
        onDelete={() => void handleDelete()}
        onExportExcel={hasBudget ? handleExportBudgetExcel : undefined}
      />

      {budgetError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{budgetError}</AlertDescription>
        </Alert>
      )}

      {isBudgetLoading ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading")}
          </CardContent>
        </Card>
      ) : hasBudget && budget ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <BudgetCategories
              budgetId={budget.budgetId ?? ""}
              categories={budget.categories}
              availableCategories={expenseCategories}
              totalBudget={budget.summary.totalBudget}
              currency={currency}
              savingCategoryId={savingCategoryId}
              removingCategoryId={removingCategoryId}
              hasHiddenCategories={hasHiddenCategories}
              onSaveCategory={handleSaveCategory}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
            />
          </div>
          <div className="xl:col-span-4">
            <BudgetSummary
              summary={budget.summary}
              topSpending={budget.topSpending}
              periodLabel={periodBadge}
              currency={currency}
              profileDailyLimit={profileDailyLimit}
            />
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-3xl border border-dashed bg-card shadow-sm">
          <CardContent className="flex flex-col items-start gap-5 bg-linear-to-br from-white via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-sm">
              <WalletCards className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("budget.empty.title", { period: periodBadge } as any)}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-200">
                {t("budget.empty.description")}
              </p>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-200">
                {t("budget.empty.hint")}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setDialogMode("create");
                setDialogOpen(true);
              }}
            >
              {t("budget.empty.cta")}
            </Button>
          </CardContent>
        </Card>
      )}

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        selectedMonth={selectedMonth}
        availableCategories={expenseCategories}
        budget={effectiveBudgetMeta}
        currency={currency}
        isSubmitting={isDialogSubmitting}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
