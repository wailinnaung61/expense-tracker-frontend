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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { monthBoundsFromYyyyMm } from "@/lib/budget-period";
import { formatCurrency } from "@/lib/utils";
import { budgetService } from "@/services/budgetService";
import { format, parseISO, subMonths } from "date-fns";
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
import {
  AlertTriangle,
  CalendarIcon,
  GripVertical,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Target,
} from "lucide-react";

function dateFromYyyyMmDd(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseAmountString(raw: string): number {
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

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
  const [totalAdjustDraft, setTotalAdjustDraft] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});
  const [isMaximized, setIsMaximized] = useState(false);
  const [useCustomPeriod, setUseCustomPeriod] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
    if (!open || mode !== "create") {
      return;
    }
    const { start, end } = monthBoundsFromYyyyMm(selectedMonth);
    setCustomStart(start);
    setCustomEnd(end);
    setUseCustomPeriod(false);
  }, [open, mode, selectedMonth]);

  useEffect(() => {
    if (!open) {
      setIsMaximized(false);
      setUseCustomPeriod(false);
      setTotalAdjustDraft("");
      return;
    }

    if (mode === "create") {
      // Try to auto-copy from previous month
      const [year, month] = selectedMonth.split("-").map(Number);
      const firstOfSelected = new Date(year, month - 1, 1);
      const firstOfPrevMonth = subMonths(firstOfSelected, 1);
      const prevMonthDay = format(firstOfPrevMonth, "yyyy-MM-dd");

      budgetService
        .getBudgetContainingDate(prevMonthDay)
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
    setUseCustomPeriod(false);
  }, [availableCategories, budget, mode, open, selectedMonth]);

  const totalAmountValue = Number(totalAmount);
  const allocatedTotal = useMemo(() => {
    return selectedCategoryIds.reduce((sum, categoryId) => {
      const value = Number(categoryDrafts[categoryId]?.allocatedAmount || 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [categoryDrafts, selectedCategoryIds]);

  const allocatedExceedsTotal =
    mode === "create" &&
    Number.isFinite(totalAmountValue) &&
    totalAmountValue > 0 &&
    allocatedTotal > totalAmountValue;

  const dateRangeInvalid =
    mode === "create" &&
    useCustomPeriod &&
    (!customStart || !customEnd || customEnd < customStart);

  const customStartDate = useMemo(() => dateFromYyyyMmDd(customStart), [customStart]);
  const customEndDate = useMemo(() => dateFromYyyyMmDd(customEnd), [customEnd]);

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
    !hasInvalidCategoryDraft &&
    !dateRangeInvalid;

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

  const applyTotalDelta = (sign: 1 | -1) => {
    const delta = parseAmountString(totalAdjustDraft);
    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }
    const base = parseAmountString(totalAmount);
    const safeBase = Number.isFinite(base) ? base : 0;
    const next = sign === 1 ? safeBase + delta : Math.max(0, safeBase - delta);
    setTotalAmount(String(next));
    setTotalAdjustDraft("");
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
      const payload: Parameters<typeof onCreate>[0] = {
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
      };
      if (useCustomPeriod && customStart && customEnd && customEnd >= customStart) {
        payload.startDate = customStart;
        payload.endDate = customEnd;
      }
      await onCreate(payload);
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
              <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label
                      htmlFor="budget-total-adjust"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      {t("budget.dialog.quickAdjustLabel" as any)}
                    </Label>
                    <Input
                      id="budget-total-adjust"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={totalAdjustDraft}
                      onChange={(e) => setTotalAdjustDraft(e.target.value)}
                      placeholder={t("budget.dialog.quickAdjustPlaceholder" as any)}
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => applyTotalDelta(1)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {t("budget.dialog.addToTotal" as any)}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => applyTotalDelta(-1)}
                    >
                      <Minus className="mr-1.5 h-3.5 w-3.5" />
                      {t("budget.dialog.subtractFromTotal" as any)}
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("budget.dialog.quickAdjustHint" as any)}
                </p>
              </div>
            </div>

            {mode === "create" && (
              <div className="space-y-3 rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 dark:border-sky-800/50 dark:bg-sky-950/20">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="budget-custom-period"
                    checked={useCustomPeriod}
                    onCheckedChange={(checked) => setUseCustomPeriod(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="budget-custom-period" className="cursor-pointer font-medium">
                      {t("budget.dialog.customPeriod" as any)}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("budget.dialog.customPeriodHint" as any)}
                    </p>
                  </div>
                </div>
                {useCustomPeriod && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div className="space-y-2">
                      <Label>{t("budget.dialog.periodStart" as any)}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            id="budget-period-start"
                            className="h-11 w-full justify-start text-left font-normal border-muted-foreground/20 hover:bg-accent/50"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            {customStartDate ? (
                              <span className="font-medium">{format(customStartDate, "PPP")}</span>
                            ) : (
                              <span className="text-muted-foreground">{t("budget.dialog.pickStartDate" as any)}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={(d) => setCustomStart(d ? format(d, "yyyy-MM-dd") : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("budget.dialog.periodEnd" as any)}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            id="budget-period-end"
                            className="h-11 w-full justify-start text-left font-normal border-muted-foreground/20 hover:bg-accent/50"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            {customEndDate ? (
                              <span className="font-medium">{format(customEndDate, "PPP")}</span>
                            ) : (
                              <span className="text-muted-foreground">{t("budget.dialog.pickEndDate" as any)}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={(d) => setCustomEnd(d ? format(d, "yyyy-MM-dd") : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
                {dateRangeInvalid && (
                  <Alert className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>{t("budget.dialog.dateRangeInvalidTitle" as any)}</AlertTitle>
                    <AlertDescription>{t("budget.dialog.dateRangeInvalid" as any)}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <div
            className={`rounded-xl border p-4 ${
              allocatedExceedsTotal
                ? "border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/25"
                : "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/30"
            }`}
          >
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

              <div
                className={`flex items-center justify-between rounded-lg p-3 ${
                  allocatedExceedsTotal
                    ? "bg-amber-100/80 dark:bg-amber-900/35"
                    : "bg-emerald-100 dark:bg-emerald-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      allocatedExceedsTotal ? "bg-amber-600" : "bg-emerald-500"
                    }`}
                  >
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {allocatedExceedsTotal
                        ? t("budget.dialog.overAllocated")
                        : t("budget.dialog.unassigned")}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        allocatedExceedsTotal
                          ? "text-amber-900 dark:text-amber-100"
                          : "text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {formatCurrency(Math.abs(totalAmountValue - allocatedTotal), currency)}
                    </div>
                  </div>
                </div>
              </div>
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