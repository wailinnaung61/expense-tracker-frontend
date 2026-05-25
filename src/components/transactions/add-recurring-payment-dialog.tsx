import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { categoryService } from "@/services/categoryService";
import { dateFnsLocaleForLanguage } from "@/lib/budget-period";
import { recurringPaymentService } from "@/services/recurringPaymentService";
import type { ExpenseCategory } from "@/types/category";
import type {
  CreateRecurringPaymentRequest,
  RecurringPayment,
  UpdateRecurringPaymentRequest,
} from "@/types/recurringPayment";
import {
  getRecurringFrequencyValue,
  RecurringFrequency,
  getRecurringStatusValue,
} from "@/types/recurringPayment";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";
import { useDirtyDialogGuard } from "@/hooks/useDirtyDialogGuard";

interface AddRecurringPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  recurringPayment?: RecurringPayment | null;
}

type RecurringPaymentFormData = {
  name: string;
  amount: string;
  categoryId: string;
  frequency: string;
  nextDueDate: Date;
  autoPay: boolean;
};

export function AddRecurringPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  recurringPayment,
}: AddRecurringPaymentDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, i18n } = useTranslation();
  const dateLocale = dateFnsLocaleForLanguage(i18n.language);

  const recurringPaymentSchema = useMemo(() => z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    amount: z
      .string()
      .min(1, t("validation.amountRequired"))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t("validation.amountPositive"),
      }),
    categoryId: z.string().min(1, t("validation.categoryRequired")),
    frequency: z.string().min(1, t("validation.frequencyRequired")),
    nextDueDate: z.date(),
    autoPay: z.boolean(),
  }), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<RecurringPaymentFormData>({
    resolver: zodResolver(recurringPaymentSchema),
    defaultValues: {
      name: "",
      amount: "",
      categoryId: "",
      frequency: RecurringFrequency.Monthly.toString(),
      nextDueDate: new Date(),
      autoPay: false,
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pageSize: 999999999,
        });

        // Remove duplicates by categoryId - keep the latest version (ISO strings are sortable)
        const seen = new Map<string, ExpenseCategory>();
        (response.items || []).forEach((cat) => {
          const existing = seen.get(cat.categoryId);
          if (!existing || (cat.updatedAt && existing.updatedAt && cat.updatedAt > existing.updatedAt) || (cat.updatedAt && !existing.updatedAt)) {
            seen.set(cat.categoryId, cat);
          }
        });

        // Filter only expense categories (type = 1)
        const expenseCategories = Array.from(seen.values()).filter(
          (cat) => cat.type === 1
        );
        setCategories(expenseCategories);
      } catch (error) {
        // Silent fail
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Load recurring payment data when editing
  useEffect(() => {
    if (recurringPayment && open) {
      reset({
        name: recurringPayment.name,
        amount: recurringPayment.amount.toString(),
        categoryId: recurringPayment.categoryId,
        frequency: getFrequencyValue(recurringPayment.frequency),
        nextDueDate: new Date(recurringPayment.nextDueDate),
        autoPay: false,
      });
    } else if (open) {
      reset({
        name: "",
        amount: "",
        categoryId: "",
        frequency: RecurringFrequency.Monthly.toString(),
        nextDueDate: new Date(),
        autoPay: false,
      });
    }
  }, [recurringPayment, open, reset]);

  const getFrequencyValue = (frequencyString: string): string =>
    getRecurringFrequencyValue(frequencyString).toString();

  const onSubmit = async (data: RecurringPaymentFormData) => {
    setIsSubmitting(true);
    try {
      if (recurringPayment) {
        const updatePayload: UpdateRecurringPaymentRequest = {
          name: data.name,
          amount: Number(data.amount),
          categoryId: data.categoryId,
          frequency: Number(data.frequency) as UpdateRecurringPaymentRequest["frequency"],
          nextDueDate: format(data.nextDueDate, "yyyy-MM-dd"),
          status: getRecurringStatusValue(recurringPayment.status),
        };
        
        await recurringPaymentService.updateRecurringPayment(
          recurringPayment.recurringId,
          updatePayload
        );
        toast.success(t("transactions.recurringDialog.updateSuccess"));
      } else {
        const createPayload: CreateRecurringPaymentRequest = {
          name: data.name,
          amount: Number(data.amount),
          categoryId: data.categoryId,
          frequency: Number(data.frequency) as CreateRecurringPaymentRequest["frequency"],
          nextDueDate: format(data.nextDueDate, "yyyy-MM-dd"),
          autoPay: data.autoPay || false,
        };
        
        await recurringPaymentService.createRecurringPayment(createPayload);
        toast.success(t("transactions.recurringDialog.createSuccess"));
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Failed to save recurring payment:', error);
      toast.error(error.message || t("errors.transactionSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const guardedOnOpenChange = useDirtyDialogGuard(isDirty, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={guardedOnOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {recurringPayment ? t("transactions.recurringDialog.editTitle") : t("transactions.recurringDialog.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {recurringPayment
              ? t("transactions.recurringDialog.editDescription")
              : t("transactions.recurringDialog.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("transactions.recurringDialog.nameLabel")}</Label>
            <Input
              id="name"
              placeholder={t("transactions.recurringDialog.namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("transactions.recurringDialog.amountLabel")}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">{t("transactions.recurringDialog.categoryLabel")}</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategoryCombobox
                  id="categoryId"
                  value={field.value}
                  onChange={field.onChange}
                  categories={categories}
                  placeholder={t("transactions.recurringDialog.categoryPlaceholder")}
                  invalid={!!errors.categoryId}
                />
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">{t("transactions.recurringDialog.frequencyLabel")}</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("transactions.recurringDialog.frequencyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecurringFrequency.Daily.toString()}>
                      {t("transactions.recurringDialog.daily")}
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Weekly.toString()}>
                      {t("transactions.recurringDialog.weekly")}
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Monthly.toString()} >
                      {t("transactions.recurringDialog.monthly")}
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Yearly.toString()}>
                      {t("transactions.recurringDialog.yearly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.frequency && (
              <p className="text-sm text-red-500">{errors.frequency.message}</p>
            )}
          </div>

          {/* Next Due Date */}
          <div className="space-y-2">
            <Label>{t("transactions.recurringDialog.dueDateLabel")}</Label>
            <Controller
              name="nextDueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: dateLocale })
                      ) : (
                        <span>{t("transactions.recurringDialog.pickDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.nextDueDate && (
              <p className="text-sm text-red-500">{errors.nextDueDate.message}</p>
            )}
          </div>

          {/* Auto Pay */}
          <div className="flex items-center space-x-2 py-2">
            <Controller
              name="autoPay"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="autoPay"
                />
              )}
            />
            <Label htmlFor="autoPay" className="font-normal cursor-pointer">
              {t("transactions.recurringDialog.autoPay")}
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => guardedOnOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {recurringPayment ? t("transactions.recurringDialog.update") : t("transactions.recurringDialog.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
