import { useTranslation } from "@/hooks/useTranslation";
import type {
  BudgetCategoryDto,
  BudgetDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "@/types/budget";
import type { ExpenseCategory } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { budgetService } from "@/services/budgetService";
import { useEffect, useMemo, useState } from "react";

type CategoryDraft = {
  allocatedAmount: string;
  alertThresholdPercent: string;
};

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  selectedMonth: string;
  availableCategories: ExpenseCategory[];
  budget: BudgetDto | null;
  currency: string;
  isSubmitting: boolean;
  onCreate: (request: CreateBudgetRequest) => Promise<void>;
  onUpdate: (request: UpdateBudgetRequest) => Promise<void>;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  mode,
  selectedMonth,
  availableCategories,
  budget,
  currency,
  isSubmitting,
  onCreate,
  onUpdate,
}: BudgetFormDialogProps) {
  const { t } = useTranslation();
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "create") {
      // Try to auto-copy from previous month
      const [year, month] = selectedMonth.split("-").map(Number);
      const prevDate = new Date(year, month - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth();

      budgetService
        .getBudgetByMonth(prevYear, prevMonth)
        .then((prevBudget) => {
          if (prevBudget?.budgetId && prevBudget.categories.length > 0) {
            // Copy total budget amount
            setTotalAmount(String(prevBudget.summary.totalBudget));

            // Copy categories with their allocations
            const prevCategoryIds = prevBudget.categories.map((c: BudgetCategoryDto) => c.categoryId);
            setSelectedCategoryIds(prevCategoryIds);

            const drafts: Record<string, CategoryDraft> = {};
            availableCategories.forEach((category) => {
              const prevCategory = prevBudget.categories.find(
                (c: BudgetCategoryDto) => c.categoryId === category.categoryId
              );
              if (prevCategory) {
                drafts[category.categoryId] = {
                  allocatedAmount: String(prevCategory.allocated),
                  alertThresholdPercent: String((prevCategory.alertThreshold * 100).toFixed(0)),
                };
              } else {
                drafts[category.categoryId] = {
                  allocatedAmount: "",
                  alertThresholdPercent: "80",
                };
              }
            });
            setCategoryDrafts(drafts);
          }
        })
        .catch(() => {
          // No previous budget found - use defaults
          setTotalAmount("");
          setSelectedCategoryIds([]);
          setCategoryDrafts(
            Object.fromEntries(
              availableCategories.map((category) => [
                category.categoryId,
                {
                  allocatedAmount: "",
                  alertThresholdPercent: "80",
                },
              ])
            )
          );
        });
      return;
    }

    setTotalAmount(String(budget?.totalAmount ?? ""));
    setSelectedCategoryIds([]);
    setCategoryDrafts({});
  }, [availableCategories, budget, mode, open]);

  const totalAmountValue = Number(totalAmount);
  const allocatedTotal = useMemo(() => {
    return selectedCategoryIds.reduce((sum, categoryId) => {
      const value = Number(categoryDrafts[categoryId]?.allocatedAmount || 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [categoryDrafts, selectedCategoryIds]);

  const allocationOverflow =
    mode === "create" &&
    Number.isFinite(totalAmountValue) &&
    totalAmountValue > 0 &&
    allocatedTotal > totalAmountValue;

  const hasInvalidCategoryDraft = selectedCategoryIds.some((categoryId) => {
    const draft = categoryDrafts[categoryId];
    const allocatedAmount = Number(draft?.allocatedAmount ?? 0);
    const alertThresholdPercent = Number(draft?.alertThresholdPercent ?? 80);

    return (
      !Number.isFinite(allocatedAmount) ||
      allocatedAmount < 0 ||
      !Number.isFinite(alertThresholdPercent) ||
      alertThresholdPercent < 0 ||
      alertThresholdPercent > 100
    );
  });

  const canSubmit =
    Number.isFinite(totalAmountValue) &&
    totalAmountValue > 0 &&
    !allocationOverflow &&
    !hasInvalidCategoryDraft;

  const handleToggleCategory = (categoryId: string, checked: boolean) => {
    setSelectedCategoryIds((current) => {
      if (checked) {
        return current.includes(categoryId) ? current : [...current, categoryId];
      }

      return current.filter((item) => item !== categoryId);
    });

    setCategoryDrafts((current) => ({
      ...current,
      [categoryId]: current[categoryId] ?? {
        allocatedAmount: "",
        alertThresholdPercent: "80",
      },
    }));
  };

  const updateCategoryDraft = (
    categoryId: string,
    field: keyof CategoryDraft,
    value: string
  ) => {
    setCategoryDrafts((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? {
          allocatedAmount: "",
          alertThresholdPercent: "80",
        }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    if (mode === "create") {
      const [year, month] = selectedMonth.split("-").map(Number);
      await onCreate({
        year,
        month,
        totalAmount: totalAmountValue,
        categories: selectedCategoryIds.map((categoryId, index) => ({
          categoryId,
          allocatedAmount: Number(categoryDrafts[categoryId]?.allocatedAmount || 0),
          alertThreshold: Number(
            (
              Number(categoryDrafts[categoryId]?.alertThresholdPercent || 80) / 100
            ).toFixed(2)
          ),
          sortOrder: index + 1,
        })),
      });
      return;
    }

    await onUpdate({
      totalAmount: totalAmountValue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? t("budget.dialog.createTitle")
              : t("budget.dialog.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? t("budget.dialog.createDescription")
              : t("budget.dialog.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-total-amount">
                {t("budget.dialog.totalAmount")}
              </Label>
              <Input
                id="budget-total-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={(event) => setTotalAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium">
                  {t("budget.dialog.allocatedSummary")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mode === "create"
                    ? t("budget.dialog.visualHint")
                    : t("budget.dialog.leaveBlankHint")}
                </div>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(allocatedTotal, currency)} / {formatCurrency(Number.isFinite(totalAmountValue) ? totalAmountValue : 0, currency)}
              </div>
            </div>
            {allocationOverflow && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {t("budget.dialog.allocationOver")}
              </p>
            )}
          </div>

          {mode === "create" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">
                  {t("budget.dialog.categoryPlanning")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("budget.dialog.selectCategories")}
                </p>
              </div>

              {availableCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  {t("budget.dialog.noExpenseCategories")}
                </div>
              ) : (
                <div className="grid gap-3 max-h-90 overflow-y-auto pr-1">
                  {availableCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.categoryId);
                    const draft = categoryDrafts[category.categoryId] ?? {
                      allocatedAmount: "",
                      alertThresholdPercent: "80",
                    };

                    return (
                      <div
                        key={category.categoryId}
                        className="rounded-xl border p-4 transition-colors hover:border-slate-300"
                      >
                        <div
                          className="flex items-center justify-between gap-3 cursor-pointer"
                          onClick={() => handleToggleCategory(category.categoryId, !isSelected)}
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleToggleCategory(category.categoryId, checked === true)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                              >
                                {category.icon}
                              </div>
                              <div>
                                <div className="font-medium" style={{ color: category.color }}>{category.displayName}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`allocation-${category.categoryId}`}>
                                {t("budget.dialog.allocation")}
                              </Label>
                              <Input
                                id={`allocation-${category.categoryId}`}
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={draft.allocatedAmount}
                                onChange={(event) =>
                                  updateCategoryDraft(
                                    category.categoryId,
                                    "allocatedAmount",
                                    event.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`threshold-${category.categoryId}`}>
                                {t("budget.categories.threshold")}
                              </Label>
                              <Input
                                id={`threshold-${category.categoryId}`}
                                type="number"
                                inputMode="decimal"
                                min="0"
                                max="100"
                                step="1"
                                value={draft.alertThresholdPercent}
                                onChange={(event) =>
                                  updateCategoryDraft(
                                    category.categoryId,
                                    "alertThresholdPercent",
                                    event.target.value
                                  )
                                }
                                placeholder="80"
                              />
                              <p className="text-xs text-muted-foreground">
                                {t("budget.dialog.categoryThresholdHint")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting
              ? t("common.loading")
              : mode === "create"
              ? t("budget.dialog.createSubmit")
              : t("budget.dialog.updateSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}