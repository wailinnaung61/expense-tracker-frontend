import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { addMonths, format, subMonths } from "date-fns";
import {
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  PencilLine,
  Plus,
  RefreshCcw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

export interface BudgetCycleSplitOption {
  anchorDate: string;
  rangeLabel: string;
  budgetId: string;
  /** Sort key (budget period start, yyyy-MM-dd). */
  periodStart: string;
}

interface BudgetHeaderProps {
  selectedMonth: string;
  periodLabel: string;
  /** Explains calendar month vs budget dates (from i18n in parent). */
  headingDescription: string;
  hasBudget: boolean;
  budgetStatus?: string;
  isBusy: boolean;
  /** When true, Excel report is generating (disables the export button only if combined in parent). */
  isExportingExcel?: boolean;
  /** Anchor dates (yyyy-MM-dd) for GET /api/budgets/containing when user picks a split cycle. */
  onBudgetAsOfDateChange: (date: string) => void;
  /** Multiple budgets overlapping this calendar month (from sampled days + current load). */
  cycleSplitOptions: BudgetCycleSplitOption[];
  activeBudgetId: string | null;
  onMonthChange: (value: string) => void;
  onCreate: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onDelete: () => void;
  /** Download budget workbook (POST + presigned GET). Hidden when no budget. */
  onExportExcel?: () => void;
}

export function BudgetHeader({
  selectedMonth,
  periodLabel,
  headingDescription,
  hasBudget,
  budgetStatus,
  isBusy,
  isExportingExcel = false,
  onBudgetAsOfDateChange,
  cycleSplitOptions,
  activeBudgetId,
  onMonthChange,
  onCreate,
  onEdit,
  onRefresh,
  onReset,
  onDelete,
  onExportExcel,
}: BudgetHeaderProps) {
  const { t } = useTranslation();
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const activeCycle = useMemo(
    () => cycleSplitOptions.find((o) => o.budgetId === activeBudgetId),
    [cycleSplitOptions, activeBudgetId]
  );

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const isCurrentMonth = useMemo(
    () => format(selectedDate, "yyyy-MM") === format(new Date(), "yyyy-MM"),
    [selectedDate]
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handlePreviousMonth = () => {
    onMonthChange(format(subMonths(selectedDate, 1), "yyyy-MM"));
  };

  const handleNextMonth = () => {
    onMonthChange(format(addMonths(selectedDate, 1), "yyyy-MM"));
  };

  const handleCurrentMonth = () => {
    onMonthChange(format(new Date(), "yyyy-MM"));
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month, 10));
    onMonthChange(format(newDate, "yyyy-MM"));
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year, 10));
    onMonthChange(format(newDate, "yyyy-MM"));
  };

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="h-1 bg-slate-200 dark:bg-slate-700" />

      <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("budget.header.title")}
            </h1>

            <Badge
              variant="outline"
              className={
                hasBudget
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground"
              }
            >
              {hasBudget
                ? budgetStatus || t("budget.header.activePlan")
                : t("budget.header.noPlan")}
            </Badge>

            <Badge
              variant="outline"
              className="max-w-[min(100%,36rem)] whitespace-normal border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left text-slate-600 dark:text-slate-300"
            >
              {periodLabel}
            </Badge>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {headingDescription}
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center xl:justify-end">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border bg-muted/50 px-2 py-1.5 shadow-xs sm:gap-2 sm:px-3 sm:py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                disabled={isBusy}
                className="h-7 w-7 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    className="h-8 px-3 text-xs font-medium"
                    aria-label={t("budget.header.selectMonth")}
                  >
                    {format(selectedDate, "MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2.5" align="center" sideOffset={8}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          {t("budget.header.month")}
                        </label>
                        <Select value={String(selectedDate.getMonth())} onValueChange={handleMonthChange}>
                          <SelectTrigger className="h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{t("common.january")}</SelectItem>
                            <SelectItem value="1">{t("common.february")}</SelectItem>
                            <SelectItem value="2">{t("common.march")}</SelectItem>
                            <SelectItem value="3">{t("common.april")}</SelectItem>
                            <SelectItem value="4">{t("common.may")}</SelectItem>
                            <SelectItem value="5">{t("common.june")}</SelectItem>
                            <SelectItem value="6">{t("common.july")}</SelectItem>
                            <SelectItem value="7">{t("common.august")}</SelectItem>
                            <SelectItem value="8">{t("common.september")}</SelectItem>
                            <SelectItem value="9">{t("common.october")}</SelectItem>
                            <SelectItem value="10">{t("common.november")}</SelectItem>
                            <SelectItem value="11">{t("common.december")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          {t("budget.header.year")}
                        </label>
                        <Select value={String(selectedDate.getFullYear())} onValueChange={handleYearChange}>
                          <SelectTrigger className="h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="h-9 w-full"
                      onClick={() => setMonthPickerOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCurrentMonth}
                  disabled={isBusy}
                  className="h-7 px-2 text-xs"
                >
                  Today
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                disabled={isBusy}
                className="h-7 w-7 shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {cycleSplitOptions.length > 1 && (
                <>
                  <div
                    className="mx-0.5 hidden h-7 w-px shrink-0 bg-border/80 sm:block"
                    aria-hidden
                  />
                  <Popover open={periodMenuOpen} onOpenChange={setPeriodMenuOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        className="h-8 max-w-[min(100%,20rem)] shrink gap-1.5 px-2.5 text-xs font-medium text-foreground hover:bg-background/80 sm:max-w-88"
                        aria-label={t("budget.header.quickCyclesLabel")}
                        aria-expanded={periodMenuOpen}
                        title={activeCycle?.rangeLabel}
                      >
                        <CalendarRange className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate text-left">
                          {activeCycle?.rangeLabel ??
                            t("budget.header.budgetPeriodPlaceholder" as any)}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={8}
                      className="w-[min(calc(100vw-2rem),22rem)] p-1.5"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <p className="px-2 pb-1.5 pt-0.5 text-xs font-medium text-muted-foreground">
                        {t("budget.header.budgetPeriodLabel" as any)}
                      </p>
                      <ul className="max-h-[min(50vh,18rem)] space-y-0.5 overflow-y-auto">
                        {cycleSplitOptions.map((opt) => {
                          const selected = activeBudgetId === opt.budgetId;
                          return (
                            <li key={opt.budgetId}>
                              <button
                                type="button"
                                className={cn(
                                  "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm leading-snug transition-colors",
                                  selected
                                    ? "bg-primary/12 text-foreground"
                                    : "text-foreground hover:bg-muted"
                                )}
                                onClick={() => {
                                  onBudgetAsOfDateChange(opt.anchorDate);
                                  setPeriodMenuOpen(false);
                                }}
                              >
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                                  {selected ? (
                                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                  ) : null}
                                </span>
                                <span className="min-w-0 flex-1">{opt.rangeLabel}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isBusy}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("budget.header.refresh")}
              </Button>

              {hasBudget ? (
                <>
                  {onExportExcel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExportExcel}
                      disabled={isBusy}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      {isExportingExcel
                        ? t("budget.header.exportingExcel")
                        : t("budget.header.exportExcel")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={isBusy}
                  >
                    <PencilLine className="mr-2 h-4 w-4" />
                    {t("budget.header.editPlan")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    disabled={isBusy}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("budget.header.reset")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                    disabled={isBusy}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("budget.header.delete")}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={onCreate}
                  disabled={isBusy}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("budget.header.createPlan")}
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {hasBudget ? budgetStatus : t("budget.header.noPlan")}
          </div>
        </div>
      </div>
    </div>
  );
}
