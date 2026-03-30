import { BudgetCategories } from "@/components/budget/budget-categories";
import { BudgetFormDialog } from "@/components/budget/budget-form-dialog";
import { BudgetHeader } from "@/components/budget/budget-header";
import { BudgetSummary } from "@/components/budget/budget-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api";
import { budgetService } from "@/services/budgetService";
import { categoryService } from "@/services/categoryService";
import { profileService } from "@/services/profileService";
import { toAlertThresholdRatio, type BudgetDto, type BudgetMonthlyResponse } from "@/types/budget";
import { TransactionType, type ExpenseCategory } from "@/types/category";
import type { ProfileResponse } from "@/types/profile";
import { endOfMonth, format } from "date-fns";
import { AlertTriangle, Loader2, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function createFallbackBudgetMeta(
  budget: BudgetMonthlyResponse | null,
  selectedMonth: string
): BudgetDto | null {
  if (!budget?.budgetId) {
    return null;
  }

  const [year, month] = selectedMonth.split("-").map(Number);
  const startDate = `${selectedMonth}-01`;
  const endDate = format(endOfMonth(new Date(year, month - 1, 1)), "yyyy-MM-dd");

  return {
    budgetId: budget.budgetId,
    periodType: "MONTHLY",
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
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
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

  const periodLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return format(new Date(year, month - 1, 1), "MMMM yyyy");
  }, [selectedMonth]);

  const effectiveBudgetMeta = budgetMeta ?? createFallbackBudgetMeta(budget, selectedMonth);
  const hasBudget = Boolean(budget?.budgetId);
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

  const loadBudget = useCallback(async () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    setIsBudgetLoading(true);
    setBudgetError(null);

    try {
      const response = await budgetService.getBudgetByMonth(year, month);
      setBudget(response);
      setBudgetMeta((current) => {
        if (current && current.budgetId === response.budgetId) {
          return {
            ...current,
            totalAmount: response.summary.totalBudget,
          };
        }

        return current;
      });
    } catch (error) {
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
  }, [selectedMonth, t]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    void loadBudget();
  }, [loadBudget]);

  const handleCreate = async (request: Parameters<typeof budgetService.createBudget>[0]) => {
    setIsDialogSubmitting(true);
    try {
      const created = await budgetService.createBudget(request);
      setBudgetMeta(created);
      setDialogOpen(false);
      await loadBudget();
      await Swal.fire({ icon: "success", title: t("budget.feedback.created"), timer: 2000, showConfirmButton: false });
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
      await Swal.fire({ icon: "success", title: t("budget.feedback.updated"), timer: 2000, showConfirmButton: false });
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
      await Swal.fire({ icon: "success", title: t("budget.feedback.categoryUpdated"), timer: 2000, showConfirmButton: false });
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
      await Swal.fire({ icon: "success", title: t("budget.feedback.categoryRemoved"), timer: 2000, showConfirmButton: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("budget.feedback.categoryRemoveFailed"));
    } finally {
      setRemovingCategoryId(null);
    }
  };

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
      await Swal.fire({ icon: "success", title: t("budget.feedback.resetSuccess"), timer: 2000, showConfirmButton: false });
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
      await Swal.fire({ icon: "success", title: t("budget.feedback.deleteSuccess"), timer: 2000, showConfirmButton: false });
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
        periodLabel={periodLabel}
        hasBudget={hasBudget}
        budgetStatus={effectiveBudgetMeta?.status}
        isBusy={isBudgetLoading || isDialogSubmitting || actionLoading !== null}
        onMonthChange={setSelectedMonth}
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
              periodLabel={periodLabel}
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
                {t("budget.empty.title", { month: periodLabel })}
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
