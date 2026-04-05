import { useTranslation } from "@/hooks/useTranslation";
import type {
  BudgetCategoryDto,
  BudgetDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "@/types/budget";
import type { ExpenseCategory } from "@/types/category";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical, Maximize2, Minimize2, Target } from "lucide-react";

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

interface SortableCategoryItemProps {
  category: ExpenseCategory;
  isSelected: boolean;
  draft: CategoryDraft;
  onToggle: (categoryId: string, checked: boolean) => void;
  onUpdateDraft: (categoryId: string, field: keyof CategoryDraft, value: string) => void;
  t: any;
}

function SortableCategoryItem({
  category,
  isSelected,
  draft,
  onToggle,
  onUpdateDraft,
  t,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.categoryId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border p-4 transition-colors hover:border-slate-300 bg-background"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onToggle(category.categoryId, checked === true)
            }
          />
          <div className="flex items-center gap-3 flex-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <div className="font-medium" style={{ color: category.color }}>
                {category.displayName}
              </div>
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
                onUpdateDraft(
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
                onUpdateDraft(
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
  const [isMaximized, setIsMaximized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedCategoryIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    if (!open) {
      setIsMaximized(false);
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
          } else {
            // Previous budget exists but has no categories - initialize empty
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
      <DialogContent className={`max-h-[90vh] overflow-y-auto ${isMaximized ? 'sm:max-w-6xl' : 'sm:max-w-3xl'} transition-all duration-300`}>
        <button
          type="button"
          onClick={() => setIsMaximized(!isMaximized)}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-14 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          <span className="sr-only">{isMaximized ? "Minimize" : "Maximize"}</span>
        </button>
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

          <div className={`rounded-xl border p-4 ${allocationOverflow ? 'border-red-300 dark:border-red-700 bg-red-50/80 dark:bg-red-950/50' : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/30'}`}>
            <div className="flex flex-col gap-3">
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
              
              {/* Unassigned Amount Display */}
              <div className={`flex items-center justify-between rounded-lg p-3 ${allocationOverflow ? 'bg-red-100 dark:bg-red-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${allocationOverflow ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {allocationOverflow ? t("budget.dialog.overAllocated") : t("budget.dialog.unassigned")}
                    </div>
                    <div className={`text-lg font-bold ${allocationOverflow ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                      {formatCurrency(Math.abs(totalAmountValue - allocatedTotal), currency)}
                    </div>
                  </div>
                </div>
                {allocationOverflow && (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              {allocationOverflow && (
                <Alert className="border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle className="text-red-900 dark:text-red-100">
                    {t("budget.dialog.cannotExceedTitle")}
                  </AlertTitle>
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {t("budget.dialog.allocationOver")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid gap-3 max-h-90 overflow-y-auto pr-1">
                    {/* Selected categories (draggable, displayed in order) */}
                    <SortableContext
                      items={selectedCategoryIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedCategoryIds.map((categoryId) => {
                        const category = availableCategories.find(
                          (c) => c.categoryId === categoryId
                        );
                        if (!category) return null;

                        const draft = categoryDrafts[category.categoryId] ?? {
                          allocatedAmount: "",
                          alertThresholdPercent: "80",
                        };

                        return (
                          <SortableCategoryItem
                            key={category.categoryId}
                            category={category}
                            isSelected={true}
                            draft={draft}
                            onToggle={handleToggleCategory}
                            onUpdateDraft={updateCategoryDraft}
                            t={t}
                          />
                        );
                      })}
                    </SortableContext>

                    {/* Unselected categories (non-draggable) */}
                    {availableCategories
                      .filter((category) => !selectedCategoryIds.includes(category.categoryId))
                      .map((category) => {
                        return (
                          <div
                            key={category.categoryId}
                            className="rounded-xl border p-4 transition-colors hover:border-slate-300 bg-background"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-5" /> {/* Spacer for alignment */}
                              <Checkbox
                                checked={false}
                                onCheckedChange={(checked) =>
                                  handleToggleCategory(category.categoryId, checked === true)
                                }
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                                  style={{
                                    backgroundColor: `${category.color}20`,
                                    color: category.color,
                                  }}
                                >
                                  {category.icon}
                                </div>
                                <div>
                                  <div className="font-medium" style={{ color: category.color }}>
                                    {category.displayName}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </DndContext>
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