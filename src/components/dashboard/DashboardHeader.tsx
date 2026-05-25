import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Info,
} from "lucide-react";
import { format, parse, addMonths, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { dateFnsLocaleForLanguage } from "@/lib/budget-period";

export type DashboardMode = "monthly" | "custom";

interface DashboardHeaderProps {
  month: string;
  onMonthChange: (month: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
  onApplyCustom: () => void;
  customError?: string | null;
}

function dateFromStr(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function DashboardHeader({
  month,
  onMonthChange,
  onRefresh,
  loading,
  mode,
  onModeChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
  customError,
}: DashboardHeaderProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = dateFnsLocaleForLanguage(i18n.language);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const parsed = parse(month, "yyyy-MM", new Date());
  const label = format(parsed, "MMMM yyyy", { locale: dateLocale });

  const goPrev = () => onMonthChange(format(subMonths(parsed, 1), "yyyy-MM"));
  const goNext = () => {
    const next = addMonths(parsed, 1);
    if (next <= new Date()) onMonthChange(format(next, "yyyy-MM"));
  };

  const isCurrentMonth = format(new Date(), "yyyy-MM") === month;

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: title + mode toggle + refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center gap-0.5 rounded-xl border bg-card p-0.5">
            <Button
              variant={mode === "monthly" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onModeChange("monthly")}
            >
              {t("dashboard.monthlyMode")}
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onModeChange("custom")}
            >
              {t("dashboard.customMode")}
            </Button>
          </div>

          <Button onClick={onRefresh} size="sm" variant="outline" disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("dashboard.refresh")}
          </Button>
        </div>
      </div>

      {/* Bottom row: monthly nav OR custom date pickers */}
      {mode === "monthly" ? (
        <div className="inline-flex items-center gap-1.5 rounded-2xl border bg-card px-2 py-1.5 shadow-sm w-fit">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold px-3 min-w-32 text-center">{label}</span>
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl px-2.5 text-xs font-medium"
              onClick={() => onMonthChange(format(new Date(), "yyyy-MM"))}
            >
              {t("dashboard.today")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={goNext}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border bg-muted/20 p-3 sm:p-3.5">
          <div className="flex flex-col lg:flex-row lg:items-end gap-2.5">
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
              {/* Start date */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{t("dashboard.startDate")}</span>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 px-3 justify-start text-left font-normal min-w-[170px] bg-background",
                        !customStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStart
                        ? format(parseISO(customStart), "PP", { locale: dateLocale })
                        : t("dashboard.startDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFromStr(customStart)}
                      onSelect={(d) => {
                        if (d) {
                          onCustomStartChange(format(d, "yyyy-MM-dd"));
                          setStartOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End date */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{t("dashboard.endDate")}</span>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 px-3 justify-start text-left font-normal min-w-[170px] bg-background",
                        !customEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEnd
                        ? format(parseISO(customEnd), "PP", { locale: dateLocale })
                        : t("dashboard.endDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFromStr(customEnd)}
                      onSelect={(d) => {
                        if (d) {
                          onCustomEndChange(format(d, "yyyy-MM-dd"));
                          setEndOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button size="sm" className="h-9 px-4 lg:self-end" onClick={onApplyCustom} disabled={loading}>
              {t("dashboard.apply")}
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>{t("dashboard.customDateMax24Tip")}</span>
            </div>
            {customError && (
              <p className="text-xs text-destructive font-medium">{customError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
