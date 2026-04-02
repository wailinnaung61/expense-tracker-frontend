import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { RecurringPayment } from "@/types/recurringPayment";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ArrowRight, CalendarClock, Bell } from "lucide-react";

interface UpcomingBillsCardProps {
  bills: RecurringPayment[];
  currency: string;
}

export function UpcomingBillsCard({ bills, currency }: UpcomingBillsCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.upcomingBills")}</CardTitle>
          <Link
            to="/tranaction"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">{t("dashboard.upcomingBillsHint" as any)}</CardDescription>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CalendarClock className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t("dashboard.noBills")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {bills.map((bill) => {
              const daysLeft = differenceInDays(new Date(bill.nextDueDate), new Date());
              const isUrgent = daysLeft <= 1;
              const isSoon = daysLeft <= 3;

              return (
                <div
                  key={bill.recurringId}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isUrgent
                        ? "bg-red-100 dark:bg-red-900/40"
                        : isSoon
                          ? "bg-amber-100 dark:bg-amber-900/40"
                          : "bg-blue-100 dark:bg-blue-900/40"
                    }`}
                  >
                    {isUrgent ? (
                      <Bell className="h-4 w-4 text-red-500" />
                    ) : (
                      <CalendarClock
                        className={`h-4 w-4 ${isSoon ? "text-amber-500" : "text-blue-500"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bill.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {bill.frequency} · {format(new Date(bill.nextDueDate), "MMM dd")}
                      {daysLeft === 0
                        ? ` · ${t("dashboard.today")}`
                        : daysLeft === 1
                          ? ` · ${t("dashboard.tomorrow")}`
                          : ` · ${daysLeft}d`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {formatCurrency(bill.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
