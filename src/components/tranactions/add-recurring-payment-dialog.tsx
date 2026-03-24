import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { categoryService } from "@/services/categoryService";
import { recurringPaymentService } from "@/services/recurringPaymentService";
import type { ExpenseCategory } from "@/types/category";
import type { RecurringPayment } from "@/types/recurringPayment";
import { RecurringFrequency } from "@/types/recurringPayment";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";

interface AddRecurringPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  recurringPayment?: RecurringPayment | null;
}

const recurringPaymentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  categoryId: z.string().min(1, "Category is required"),
  frequency: z.string().min(1, "Frequency is required"),
  nextDueDate: z.date(),
});

type RecurringPaymentFormData = z.infer<typeof recurringPaymentSchema>;

export function AddRecurringPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  recurringPayment,
}: AddRecurringPaymentDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RecurringPaymentFormData>({
    resolver: zodResolver(recurringPaymentSchema),
    defaultValues: {
      name: "",
      amount: "",
      categoryId: "",
      frequency: RecurringFrequency.Monthly.toString(),
      nextDueDate: new Date(),
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pagination: {
            pageNumber: 1,
            pageSize: 999999999,
          },
        });

        // Remove duplicates by categoryId - keep the latest version (ISO strings are sortable)
        const seen = new Map<string, ExpenseCategory>();
        (response.items || []).forEach((cat) => {
          const existing = seen.get(cat.categoryId);
          if (!existing || cat.updatedAt > existing.updatedAt) {
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
      });
    } else if (open) {
      reset({
        name: "",
        amount: "",
        categoryId: "",
        frequency: "",
        nextDueDate: new Date(),
      });
    }
  }, [recurringPayment, open, reset]);

  const getFrequencyValue = (frequencyString: string): string => {
    switch (frequencyString.toLowerCase()) {
      case "daily":
        return RecurringFrequency.Daily.toString();
      case "weekly":
        return RecurringFrequency.Weekly.toString();
      case "monthly":
        return RecurringFrequency.Monthly.toString();
      case "yearly":
        return RecurringFrequency.Yearly.toString();
      default:
        return "";
    }
  };

  const onSubmit = async (data: RecurringPaymentFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        amount: Number(data.amount),
        categoryId: data.categoryId,
        frequency: Number(data.frequency),
        nextDueDate: format(data.nextDueDate, "yyyy-MM-dd"),
      };

      if (recurringPayment) {
        await recurringPaymentService.updateRecurringPayment(
          recurringPayment.recurringId,
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Recurring payment updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await recurringPaymentService.createRecurringPayment(payload);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Recurring payment created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save recurring payment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {recurringPayment ? "Edit Recurring Payment" : "Add Recurring Payment"}
          </DialogTitle>
          <DialogDescription>
            {recurringPayment
              ? "Update the recurring payment details"
              : "Create a new recurring payment"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter payment name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
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
            <Label htmlFor="categoryId">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.icon} {category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecurringFrequency.Daily.toString()}>
                      Daily
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Weekly.toString()}>
                      Weekly
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Monthly.toString()} >
                      Monthly
                    </SelectItem>
                    <SelectItem value={RecurringFrequency.Yearly.toString()}>
                      Yearly
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
            <Label>Next Due Date</Label>
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
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {recurringPayment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
