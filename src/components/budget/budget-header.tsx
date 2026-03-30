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
import { addMonths, format, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
  RefreshCcw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

interface BudgetHeaderProps {
  selectedMonth: string;
  periodLabel: string;
  hasBudget: boolean;
  budgetStatus?: string;
  isBusy: boolean;
  onMonthChange: (value: string) => void;
  onCreate: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function BudgetHeader({
  selectedMonth,
  periodLabel,
  hasBudget,
  budgetStatus,
  isBusy,
  onMonthChange,
  onCreate,
  onEdit,
  onRefresh,
  onReset,
  onDelete,
}: BudgetHeaderProps) {
  const { t } = useTranslation();
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

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
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
            >
              {periodLabel}
            </Badge>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {t("budget.header.subtitle", { month: periodLabel })}
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 px-3.5 py-2.5 shadow-xs">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                disabled={isBusy}
                className="h-7 w-7"
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
                          Month
                        </label>
                        <Select value={String(selectedDate.getMonth())} onValueChange={handleMonthChange}>
                          <SelectTrigger className="h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">January</SelectItem>
                            <SelectItem value="1">February</SelectItem>
                            <SelectItem value="2">March</SelectItem>
                            <SelectItem value="3">April</SelectItem>
                            <SelectItem value="4">May</SelectItem>
                            <SelectItem value="5">June</SelectItem>
                            <SelectItem value="6">July</SelectItem>
                            <SelectItem value="7">August</SelectItem>
                            <SelectItem value="8">September</SelectItem>
                            <SelectItem value="9">October</SelectItem>
                            <SelectItem value="10">November</SelectItem>
                            <SelectItem value="11">December</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Year
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
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
