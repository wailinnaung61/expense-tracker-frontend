import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse, addMonths, subMonths } from "date-fns";

interface DashboardHeaderProps {
  month: string; // "2026-04"
  onMonthChange: (month: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function DashboardHeader({ month, onMonthChange, onRefresh, loading }: DashboardHeaderProps) {
  const { t } = useTranslation();

  const parsed = parse(month, "yyyy-MM", new Date());
  const label = format(parsed, "MMMM yyyy");

  const goPrev = () => onMonthChange(format(subMonths(parsed, 1), "yyyy-MM"));
  const goNext = () => {
    const next = addMonths(parsed, 1);
    if (next <= new Date()) onMonthChange(format(next, "yyyy-MM"));
  };

  const isCurrentMonth = format(new Date(), "yyyy-MM") === month;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground tracking-wide">
          {t("dashboard.subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Month Navigator */}
        <div className="flex items-center gap-1 rounded-xl border bg-card px-1 py-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2 min-w-30 text-center">{label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goNext}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onRefresh} size="sm" variant="outline" disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("dashboard.refresh")}
        </Button>
      </div>
    </div>
  );
}
