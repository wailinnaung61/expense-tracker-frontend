import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTranslation } from "@/hooks/useTranslation";
import { Textarea } from "@/components/ui/textarea";
import { savingsService } from "@/services/savingsService";
import { SavingTransactionType } from "@/types/savings";
import type { SavingGoal, SavingGoalContribution } from "@/types/savings";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import spinnerGif from "@/assets/Spinner.gif";

interface ContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  goal: SavingGoal | null;
  currency?: string;
}

type ContributionFormData = {
  type: string;
  amount: string;
  contributionDate: Date;
  notes?: string;
};

export function ContributionDialog({
  open,
  onOpenChange,
  onSuccess,
  goal,
  currency = "USD",
}: ContributionDialogProps) {
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<SavingGoalContribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [nextCursorId, setNextCursorId] = useState<string | undefined>();

  const contributionSchema = useMemo(
    () =>
      z.object({
        type: z.string().min(1),
        amount: z
          .string()
          .min(1, t("savings.validation.amountRequired"))
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: t("savings.validation.amountPositive"),
          }),
        contributionDate: z.date(),
        notes: z.string().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      type: String(SavingTransactionType.Deposit),
      amount: "",
      contributionDate: new Date(),
      notes: "",
    },
  });

  const PAGE_SIZE = 10;

  const fetchContributions = useCallback(async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const response = await savingsService.getContributions(goal.savingGoalId, PAGE_SIZE);
      setContributions(response.items);
      setHasNextPage(response.hasNextPage);
      setNextCursor(response.nextCursor);
      setNextCursorId(response.nextCursorId);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [goal]);

  const loadMore = useCallback(async () => {
    if (!goal || !hasNextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await savingsService.getContributions(
        goal.savingGoalId,
        PAGE_SIZE,
        nextCursor,
        nextCursorId
      );
      setContributions((prev) => [...prev, ...response.items]);
      setHasNextPage(response.hasNextPage);
      setNextCursor(response.nextCursor);
      setNextCursorId(response.nextCursorId);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [goal, hasNextPage, loadingMore, nextCursor, nextCursorId]);

  useEffect(() => {
    if (open && goal) {
      fetchContributions();
      reset({
        type: String(SavingTransactionType.Deposit),
        amount: "",
        contributionDate: new Date(),
        notes: "",
      });
    }
  }, [open, goal, fetchContributions, reset]);

  const onSubmit = async (data: ContributionFormData) => {
    if (!goal) return;
    try {
      await savingsService.addContribution(goal.savingGoalId, {
        type: Number(data.type) as SavingTransactionType,
        amount: Number(data.amount),
        contributionDate: format(data.contributionDate, "yyyy-MM-dd"),
        notes: data.notes || "",
      });
      toast.success(t("savings.feedback.contributionAdded"));
      reset({
        type: String(SavingTransactionType.Deposit),
        amount: "",
        contributionDate: new Date(),
        notes: "",
      });
      fetchContributions();
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("savings.feedback.contributionFailed")
      );
    }
  };

  const handleDeleteContribution = async (contributionId: string) => {
    if (!goal) return;
    onOpenChange(false);
    const result = await Swal.fire({
      title: t("savings.feedback.confirmDeleteContributionTitle"),
      text: t("savings.feedback.confirmDeleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("savings.feedback.confirmButton"),
      cancelButtonText: t("savings.feedback.cancelButton"),
    });

    if (result.isConfirmed) {
      try {
        await savingsService.deleteContribution(goal.savingGoalId, contributionId);
        toast.success(t("savings.feedback.contributionDeleted"));
        onSuccess();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("savings.feedback.contributionDeleteFailed")
        );
        onOpenChange(true);
      }
      return;
    }
    onOpenChange(true);
  };

  if (!goal) return null;

  const progressCapped = Math.min(goal.progressPercentage, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Goal Summary Header */}
        <div
          className="relative overflow-hidden px-6 pt-6 pb-5"
          style={{
            background: goal.color
              ? `linear-gradient(135deg, ${goal.color}18, ${goal.color}08)`
              : "linear-gradient(135deg, rgba(16,185,129,0.09), rgba(16,185,129,0.03))",
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
            style={{
              background: goal.color
                ? `radial-gradient(circle, ${goal.color}40, transparent)`
                : "radial-gradient(circle, rgba(16,185,129,0.25), transparent)",
            }}
          />
          <div className="relative">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    background: goal.color
                      ? `linear-gradient(135deg, ${goal.color}, ${goal.color}cc)`
                      : "linear-gradient(135deg, #10b981, #16a34a)",
                  }}
                >
                  <span className="text-lg">{goal.icon || "🎯"}</span>
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base truncate">{goal.goalName}</DialogTitle>
                  <DialogDescription className="text-xs">
                    {t("savings.contribution.title")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Mini Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">
                  {formatCurrency(goal.currentAmount, currency)}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(goal.targetAmount, currency)}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressCapped}%`,
                    background: goal.color
                      ? `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)`
                      : "linear-gradient(90deg, #10b981, #16a34a)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{progressCapped.toFixed(1)}% {t("savings.goals.reached")}</span>
                <span>{formatCurrency(goal.remainingAmount, currency)} {t("savings.goals.remaining")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("savings.contribution.type")}
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(String(SavingTransactionType.Deposit))}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      field.value === String(SavingTransactionType.Deposit)
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    {t("savings.contribution.deposit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(String(SavingTransactionType.Withdrawal))}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      field.value === String(SavingTransactionType.Withdrawal)
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 shadow-sm"
                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    {t("savings.contribution.withdrawal")}
                  </button>
                </div>
              )}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("savings.contribution.amount")} *
            </Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              className="h-11 text-lg font-semibold"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("savings.contribution.date")}
            </Label>
            <Controller
              name="contributionDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {field.value ? format(field.value, "PPP") : t("savings.dialog.pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="contribNotes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("savings.contribution.notes")}
            </Label>
            <Textarea
              id="contribNotes"
              placeholder={t("savings.contribution.notesPlaceholder")}
              className="resize-none"
              rows={2}
              {...register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t("savings.dialog.cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("savings.contribution.add")}
            </Button>
          </div>
        </form>

        {/* Contribution History */}
        <div className="border-t px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
              <ArrowDownCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-semibold">{t("savings.contribution.history")}</h4>
            {contributions.length > 0 && (
              <span className="ml-auto text-[11px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                {contributions.length}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <img src={spinnerGif} alt="Loading" className="w-8 h-8" />
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("savings.contribution.noHistory")}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {contributions.map((c) => {
                const isDeposit = c.type.toUpperCase() === "DEPOSIT";
                return (
                  <div
                    key={c.contributionId}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? "bg-emerald-100 dark:bg-emerald-900/40"
                            : "bg-rose-100 dark:bg-rose-900/40"
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isDeposit
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}
                          {formatCurrency(c.amount, currency)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(c.contributionDate), "MMM dd, yyyy")}
                          {c.notes ? ` · ${c.notes}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                      onClick={() => handleDeleteContribution(c.contributionId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              {hasNextPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground mt-1"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : null}
                  {loadingMore ? t("common.loading") : t("savings.contribution.loadMore")}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
