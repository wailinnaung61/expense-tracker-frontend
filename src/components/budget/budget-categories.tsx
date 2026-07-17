import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  CategoryCombobox,
  CATEGORY_COMBOBOX_ALL_VALUE,
} from "@/components/categories/category-combobox";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { BudgetCategoryDto } from "@/types/budget";
import { normalizeAlertThresholdPercent } from "@/types/budget";
import type { ExpenseCategory } from "@/types/category";
import { AlertTriangle, Info, Loader2, Plus, Save, Trash2, WalletCards, Wallet, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BudgetCategoriesProps {
  budgetId: string;
  categories: BudgetCategoryDto[];
  availableCategories: ExpenseCategory[];
  totalBudget: number;
  currency: string;
  savingCategoryId: string | null;
  removingCategoryId: string | null;
  hasHiddenCategories: boolean;
  onSaveCategory: (
    budgetCategoryId: string,
    values: { allocatedAmount: number; alertThresholdPercent: number; isReserved: boolean }
  ) => Promise<void>;
  onToggleReserved: (budgetCategoryId: string, isReserved: boolean) => Promise<void>;
  onAddCategory: (
    categoryId: string,
    allocatedAmount: number,
    isReserved: boolean
  ) => Promise<boolean>;
  onRemoveCategory: (budgetCategoryId: string) => Promise<void>;
}

interface CategoryDraft {
  allocatedAmount: string;
  alertThresholdPercent: string;
}

type StatusTranslationKey =
  | "budget.categories.statusOver"
  | "budget.categories.statusWarning"
  | "budget.categories.statusSafe";

function getStatusStyles(status: string) {
  switch (status.toUpperCase()) {
    case "CRITICAL":
    case "OVER":
    case "OVER_BUDGET":
      return {
        badgeClassName: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
        progressClassName: "bg-red-600",
        translationKey: "budget.categories.statusOver" as StatusTranslationKey,
      };
    case "WARNING":
    case "RISK":
      return {
        badgeClassName: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
        progressClassName: "bg-amber-500",
        translationKey: "budget.categories.statusWarning" as StatusTranslationKey,
      };
    default:
      return {
        badgeClassName: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
        progressClassName: "bg-emerald-600",
        translationKey: "budget.categories.statusSafe" as StatusTranslationKey,
      };
  }
}

export function BudgetCategories({
  budgetId: _budgetId,
  categories,
  availableCategories,
  totalBudget,
  currency,
  savingCategoryId,
  removingCategoryId,
  hasHiddenCategories,
  onSaveCategory,
  onToggleReserved,
  onAddCategory,
  onRemoveCategory,
}: BudgetCategoriesProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>({});
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});
  const [addReserved, setAddReserved] = useState<Record<string, boolean>>({});
  const [categoryFilterId, setCategoryFilterId] = useState(CATEGORY_COMBOBOX_ALL_VALUE);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        categories.map((category) => [
          category.budgetCategoryId,
          {
            allocatedAmount: String(category.allocated),
            alertThresholdPercent: String(
              normalizeAlertThresholdPercent(category.alertThreshold, category.allocated)
            ),
          },
        ])
      )
    );
    setCategoryFilterId(CATEGORY_COMBOBOX_ALL_VALUE);
  }, [categories]);

  const totalAllocated = useMemo(() => {
    return categories.reduce((sum, category) => sum + category.allocated, 0);
  }, [categories]);

  const unassignedBudget = totalBudget - totalAllocated;

  const handleDraftChange = (
    budgetCategoryId: string,
    field: keyof CategoryDraft,
    value: string
  ) => {
    setDrafts((current) => ({
      ...current,
      [budgetCategoryId]: {
        ...(current[budgetCategoryId] ?? {
          allocatedAmount: "",
          alertThresholdPercent: "80",
        }),
        [field]: value,
      },
    }));
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const filterableCategories = useMemo(() => {
    const byId = new Map(availableCategories.map((c) => [c.categoryId, c]));
    return sortedCategories
      .map((bc) => byId.get(bc.categoryId))
      .filter((c): c is ExpenseCategory => c !== undefined);
  }, [sortedCategories, availableCategories]);

  const displayedCategories = useMemo(() => {
    if (categoryFilterId === CATEGORY_COMBOBOX_ALL_VALUE) {
      return sortedCategories;
    }
    return sortedCategories.filter((c) => c.categoryId === categoryFilterId);
  }, [sortedCategories, categoryFilterId]);

  const trackedCategoryIds = new Set(categories.map((c) => c.categoryId));
  const untrackedCategories = availableCategories.filter(
    (c) => !trackedCategoryIds.has(c.categoryId)
  );

  return (
    <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <CardHeader className="border-b bg-card pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-foreground">{t("budget.categories.title")}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("budget.categories.description")}
            </CardDescription>
          </div>
          {sortedCategories.length > 0 && (
            <div className="w-full shrink-0 sm:w-52">
              <Label htmlFor="budget-category-filter" className="sr-only">
                {t("budget.categories.filterLabel")}
              </Label>
              <CategoryCombobox
                id="budget-category-filter"
                value={categoryFilterId}
                onChange={setCategoryFilterId}
                categories={filterableCategories}
                includeAllOption
                allLabel={t("budget.categories.filterAll")}
                placeholder={t("budget.categories.filterAll")}
                triggerClassName="h-10"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-500/20 dark:via-cyan-500/10 p-5 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-3">
                <WalletCards className="h-5 w-5 text-white" />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] font-medium text-blue-700 dark:text-blue-300 mb-2">
                {t("budget.categories.allocatedTotal")}
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalAllocated, currency)}
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500/10 via-green-500/5 to-transparent dark:from-emerald-500/20 dark:via-green-500/10 p-5 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-3">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                {t("budget.categories.totalBudget")}
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalBudget, currency)}
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/10 p-5 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] font-medium text-amber-700 dark:text-amber-300 mb-2">
                {t("budget.categories.unassigned")}
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(unassignedBudget, currency)}
              </div>
            </div>
          </div>
        </div>

        {hasHiddenCategories && (
          <Alert className="rounded-2xl border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100">
            <Info className="h-4 w-4" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">{t("budget.categories.lockedNoticeTitle")}</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {t("budget.categories.lockedNoticeDescription")}
            </AlertDescription>
          </Alert>
        )}

        {sortedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">
            {t("budget.categories.noCategories")}
          </div>
        ) : displayedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">
            {t("budget.categories.noFilterResults")}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCategories.map((category) => {
              const draft = drafts[category.budgetCategoryId] ?? {
                allocatedAmount: String(category.allocated),
                alertThresholdPercent: String(
                  normalizeAlertThresholdPercent(category.alertThreshold, category.allocated)
                ),
              };

              const statusStyles = getStatusStyles(category.status);
              const allocatedAmount = Number(draft.allocatedAmount);
              const alertThresholdPercent = Number(draft.alertThresholdPercent);
              const hasChanges =
                Number.isFinite(allocatedAmount) &&
                Number.isFinite(alertThresholdPercent) &&
                (allocatedAmount !== category.allocated ||
                  alertThresholdPercent !==
                    normalizeAlertThresholdPercent(
                      category.alertThreshold,
                      category.allocated
                    ));

              const isInvalid =
                !Number.isFinite(allocatedAmount) ||
                allocatedAmount < 0 ||
                !Number.isFinite(alertThresholdPercent) ||
                alertThresholdPercent < 0 ||
                alertThresholdPercent > 100;

              return (
                <div key={category.budgetCategoryId} className="rounded-3xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border text-2xl shadow-xs"
                        style={{
                          backgroundColor: `${category.color}18`,
                          color: category.color,
                          borderColor: `${category.color}30`,
                        }}
                      >
                        {category.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {category.name}
                          </h3>
                          <Badge variant="outline" className={statusStyles.badgeClassName}>
                            {t(statusStyles.translationKey)}
                          </Badge>
                          {category.isReserved && (
                            <Badge
                              variant="outline"
                              className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            >
                              {t("budget.categories.reservedBadge")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            {t("budget.categories.spent")}: {formatCurrency(category.spent, currency)}
                          </span>
                          <span>
                            {t("budget.categories.allocated")}: {formatCurrency(category.allocated, currency)}
                          </span>
                          <span>
                            {t("budget.categories.remaining")}: {formatCurrency(category.remaining, currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-right shadow-xs">
                        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          {t("budget.categories.usage")}
                        </div>
                        <div className="text-sm font-semibold text-foreground">{category.usagePercent}%</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                        disabled={removingCategoryId === category.budgetCategoryId}
                        onClick={() => onRemoveCategory(category.budgetCategoryId)}
                      >
                        {removingCategoryId === category.budgetCategoryId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-4 py-3">
                    <div>
                      <Label
                        htmlFor={`reserved-${category.budgetCategoryId}`}
                        className="text-sm font-medium text-foreground"
                      >
                        {t("budget.categories.reserveFixed")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("budget.categories.reserveFixedHint")}
                      </p>
                    </div>
                    <Switch
                      id={`reserved-${category.budgetCategoryId}`}
                      checked={category.isReserved}
                      disabled={savingCategoryId === category.budgetCategoryId}
                      onCheckedChange={(checked) =>
                        onToggleReserved(category.budgetCategoryId, checked)
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-foreground">
                      <span>{t("budget.categories.progress")}</span>
                      <span className="font-medium">{category.usagePercent}%</span>
                    </div>
                    <Progress
                      value={Math.min(category.usagePercent, 100)}
                      className="h-2"
                      indicatorClassName={statusStyles.progressClassName}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("budget.categories.alertAt", {
                        percent: normalizeAlertThresholdPercent(
                          category.alertThreshold,
                          category.allocated
                        ),
                      })}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-2xl border bg-muted/25 p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <div className="space-y-2">
                      <Label htmlFor={`allocated-${category.budgetCategoryId}`} className="text-foreground">
                        {t("budget.categories.allocated")}
                      </Label>
                      <Input
                        id={`allocated-${category.budgetCategoryId}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={draft.allocatedAmount}
                        onChange={(event) =>
                          handleDraftChange(
                            category.budgetCategoryId,
                            "allocatedAmount",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`threshold-${category.budgetCategoryId}`} className="text-foreground">
                        {t("budget.categories.threshold")}
                      </Label>
                      <Input
                        id={`threshold-${category.budgetCategoryId}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="1"
                        value={draft.alertThresholdPercent}
                        onChange={(event) =>
                          handleDraftChange(
                            category.budgetCategoryId,
                            "alertThresholdPercent",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        onSaveCategory(category.budgetCategoryId, {
                          allocatedAmount: Number(draft.allocatedAmount),
                          alertThresholdPercent: Number(draft.alertThresholdPercent),
                          isReserved: category.isReserved,
                        })
                      }
                      disabled={!hasChanges || isInvalid || savingCategoryId === category.budgetCategoryId}
                    >
                      {savingCategoryId === category.budgetCategoryId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {savingCategoryId === category.budgetCategoryId
                        ? t("budget.categories.saving")
                        : t("budget.categories.save")}
                    </Button>
                  </div>

                  {(category.usagePercent >= 100 || allocatedAmount < category.spent) && (
                    <div className="mt-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <span>{t("budget.categories.overBudgetHint")}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {untrackedCategories.length > 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Plus className="h-4 w-4" />
              {t("budget.categories.addCategory")}
            </div>
            <div className="space-y-2">
              {untrackedCategories.map((cat) => {
                const addAmount = Number(addAmounts[cat.categoryId] ?? 0);
                const isInvalidAmount = !addAmounts[cat.categoryId] || addAmount <= 0;
                const isReserved = addReserved[cat.categoryId] ?? false;

                return (
                  <div key={cat.categoryId} className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg"
                        style={{
                          backgroundColor: `${cat.color}18`,
                          color: cat.color,
                          borderColor: `${cat.color}30`,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <span
                        className="min-w-24 flex-1 text-sm font-medium"
                        style={{ color: cat.color }}
                      >
                        {cat.displayName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`add-reserved-${cat.categoryId}`}
                          className="text-xs text-muted-foreground whitespace-nowrap"
                        >
                          {t("budget.categories.reserveFixed")}
                        </Label>
                        <Switch
                          id={`add-reserved-${cat.categoryId}`}
                          checked={isReserved}
                          onCheckedChange={(checked) =>
                            setAddReserved((prev) => ({
                              ...prev,
                              [cat.categoryId]: checked,
                            }))
                          }
                        />
                      </div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-28 text-sm"
                        value={addAmounts[cat.categoryId] ?? ""}
                        onChange={(e) =>
                          setAddAmounts((prev) => ({ ...prev, [cat.categoryId]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        disabled={isInvalidAmount}
                        onClick={async () => {
                          const wasAdded = await onAddCategory(
                            cat.categoryId,
                            Number(addAmounts[cat.categoryId] ?? 0),
                            isReserved
                          );
                          if (wasAdded) {
                            setAddAmounts((prev) => ({ ...prev, [cat.categoryId]: "" }));
                            setAddReserved((prev) => ({ ...prev, [cat.categoryId]: false }));
                          }
                        }}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {t("budget.categories.add")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
