import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { recurringPaymentService } from "@/services/recurringPaymentService";
import { transactionService } from "@/services/tranactionService";
import type { RecurringPayment } from "@/types/recurringPayment";
import { PaymentStatus, TransactionType } from "@/types/transaction";
import { differenceInDays, format } from "date-fns";
import { Calendar, Clock, MoreVertical, Plus, Repeat } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AddRecurringPaymentDialog } from "./add-recurring-payment-dialog";
import spinnerGif from "@/assets/Spinner.gif";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

interface UpcomingPaymentsProps {
  startDate?: string;
  endDate?: string;
  onTransactionCreated?: () => void;
  refreshKey?: number;
}

export function UpcomingPayments({ startDate, endDate, onTransactionCreated, refreshKey: externalRefreshKey = 0 }: UpcomingPaymentsProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!startDate || !endDate) {
      setPayments([]);
      return;
    }

    setLoading(true);
    try {
      const data = await recurringPaymentService.getUpcomingPayments({
        startDate,
        endDate,
      });
      setPayments(data);
      setShowAll(false); // Reset to show only 5 when data refreshes
    } catch (error) {
      console.error("Failed to fetch upcoming payments:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, localRefreshKey, externalRefreshKey]);

  const getDaysLeft = (nextDueDate: string): number => {
    return differenceInDays(new Date(nextDueDate), new Date());
  };

  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft < 0)
      return (
        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white">
          {t("transactions.upcoming.overdue")}
        </Badge>
      );
    if (daysLeft <= 3)
      return (
        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white">
          {t("transactions.upcoming.dueSoon")}
        </Badge>
      );
    if (daysLeft <= 7)
      return (
        <Badge className="bg-yellow-400/10 text-yellow-600 hover:bg-yellow-500 hover:text-white">
          {t("transactions.upcoming.thisWeek")}
        </Badge>
      );
    return <Badge variant="outline">{t("transactions.upcoming.upcoming")}</Badge>;
  };

  const getStatusColor = (daysLeft: number): string => {
    if (daysLeft < 0) return "text-red-600 dark:text-red-400";
    if (daysLeft <= 3) return "text-red-600 dark:text-red-400";
    if (daysLeft <= 7) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  const handlePayNow = async (payment: RecurringPayment) => {
    const result = await Swal.fire({
      title: t("transactions.upcoming.payConfirmTitle"),
      text: t("transactions.upcoming.payConfirmText", { name: payment.name }),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("transactions.upcoming.payConfirmButton"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        // Mark the recurring payment as paid
        await recurringPaymentService.markAsPaid(payment.recurringId);

        // Create a transaction record for this payment
        await transactionService.createTransaction({
          type: TransactionType.Expense,
          categoryId: payment.categoryId,
          amount: payment.amount,
          tranactionDate: format(new Date(), "yyyy-MM-dd"),
          status: PaymentStatus.Completed,
          description: `${payment.name} - ${payment.frequency} payment`,
          note: `Auto-created from recurring payment: ${payment.name}`,
          imageUrl: "",
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: t("transactions.upcoming.paySuccess"),
          timer: 2000,
          showConfirmButton: false,
        });
        setLocalRefreshKey((prev) => prev + 1);
        onTransactionCreated?.();
      } catch (error: any) {
        console.error("Failed to process payment:", error);
      }
    }
  };

  const handleEdit = (payment: RecurringPayment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleDelete = async (payment: RecurringPayment) => {
    const result = await Swal.fire({
      title: t("transactions.upcoming.deleteConfirmTitle"),
      text: t("transactions.upcoming.deleteConfirmText", { name: payment.name }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("transactions.upcoming.deleteConfirmButton"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await recurringPaymentService.deleteRecurringPayment(payment.recurringId);
        Swal.fire({
          icon: "success",
          title: t("transactions.upcoming.deleteSuccessTitle"),
          text: t("transactions.upcoming.deleteSuccessText"),
          timer: 2000,
          showConfirmButton: false,
        });
        setLocalRefreshKey((prev) => prev + 1);
      } catch (error: any) {
        console.error("Failed to delete recurring payment:", error);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedPayment(null);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setLocalRefreshKey((prev) => prev + 1);
  };

  const formatCurrency = (amount: number) => {
    const currency = user?.currency || "USD";
    const localeMap: Record<string, string> = {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'JPY': 'ja-JP',
      'SGD': 'en-SG',
      'THB': 'th-TH',
      'MMK': 'my-MM',
    };
    const locale = localeMap[currency] || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      currencyDisplay: 'symbol', // Force symbol display
    }).format(amount);
  };

  return (
    <>
      <Card className="rounded-lg bg-background/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                {t("transactions.upcoming.title")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("transactions.upcoming.description")}
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              {t("transactions.upcoming.addNew")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("transactions.upcoming.noPayments")}
            </div>
          ) : (
            <>
              {(showAll ? payments : payments.slice(0, 5)).map((payment) => {
                const daysLeft = getDaysLeft(payment.nextDueDate);
                return (
                  <div
                    key={payment.recurringId}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30 transition-all"
                  >
                    {/* Left side */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center text-xs font-medium text-muted-foreground">
                        <div
                          className={`flex items-center gap-1 ${getStatusColor(
                            daysLeft
                          )}`}
                        >
                          <Clock className="h-4 w-4" />
                          <span>{daysLeft}d</span>
                        </div>
                        <div className="mt-1">{getStatusBadge(daysLeft)}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {payment.name}
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0.5 text-xs"
                          >
                            <Repeat className="h-3 w-3 mr-1" />
                            {payment.frequency}
                          </Badge>
                          {payment.missedCount > 0 && (
                            <Badge
                              className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                            >
                              ⚠️ {t("transactions.upcoming.missed", { count: payment.missedCount })}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.categoryName || t("transactions.upcoming.unknownCategory")} &bull; {t("transactions.upcoming.due")}{" "}
                          {format(new Date(payment.nextDueDate), "MMM dd")}
                          {payment.lastPaidDate && (
                            <> &bull; {t("transactions.upcoming.lastPaid")} {format(new Date(payment.lastPaidDate), "MMM dd")}</>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-lg font-bold transition-opacity group-hover:animate-pulse ${getStatusColor(
                          daysLeft
                        )}`}
                      >
                        {formatCurrency(payment.amount)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap text-xs"
                        onClick={() => handlePayNow(payment)}
                      >
                        {t("transactions.upcoming.payNow")}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(payment)}>
                            {t("transactions.upcoming.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment)}
                            className="text-red-600"
                          >
                            {t("transactions.upcoming.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div className="pt-4 mt-2 flex flex-col sm:flex-row sm:items-center justify-between border-t border-border gap-2">
                <div className="text-sm text-muted-foreground pt-2">
                  {t("transactions.upcoming.totalUpcoming")}{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
                {!showAll && payments.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    className="whitespace-nowrap"
                  >
                    {t("transactions.upcoming.viewAll", { count: payments.length })}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddRecurringPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        recurringPayment={selectedPayment}
      />
    </>
  );
}
