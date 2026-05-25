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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { ApiError } from "@/lib/api";
import { categoryService } from "@/services/categoryService";
import { budgetService } from "@/services/budgetService";
import { transactionService } from "@/services/transactionService";
import { s3Service } from "@/services/s3Service";
import type { BudgetCategoryDto } from "@/types/budget";
import type { ExpenseCategory } from "@/types/category";
import {
  PaymentStatus,
  TransactionType,
  type Transaction,
} from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import type { Locale } from "date-fns";
import { CalendarIcon, Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";
import { useDirtyDialogGuard } from "@/hooks/useDirtyDialogGuard";
import {
  dateFnsLocaleForLanguage,
  formatBudgetRangeLabel,
  isTransactionDayInBudgetPeriod,
} from "@/lib/budget-period";
import { cn, formatCurrency } from "@/lib/utils";

const BUDGET_MONTH_LOCALES: Record<string, Locale> = { en: enUS, ja };

function formatBudgetMonthLabel(date: Date, lang: string): string {
  const key = lang.split("-")[0] || "en";
  const locale = BUDGET_MONTH_LOCALES[key] ?? enUS;
  return format(date, "MMMM yyyy", { locale });
}

type ExpenseBudgetHint =
  | { kind: "hidden" }
  | { kind: "loading" }
  | { kind: "pick_category"; monthLabel: string }
  | { kind: "no_budget"; monthLabel: string }
  | { kind: "outside_period"; monthLabel: string; rangeLabel: string }
  | { kind: "not_in_budget"; monthLabel: string }
  | { kind: "ok"; monthLabel: string; row: BudgetCategoryDto };

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
  currency?: string;
}

type TransactionFormData = {
  type: string;
  categoryId: string;
  amount: string;
  tranactionDate: Date;
  status: string;
  description?: string;
  note?: string;
  imageUrl?: string;
};

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
  currency = "USD",
}: AddTransactionDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ExpenseCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const addAnotherRef = useRef(false);
  const { t, i18n } = useTranslation();
  const [expenseBudgetHint, setExpenseBudgetHint] = useState<ExpenseBudgetHint>({ kind: "hidden" });
  const isEditMode = Boolean(transaction && transaction.tranactionId);

  const transactionSchema = useMemo(() => z.object({
    type: z.string().min(1, t("validation.typeRequired")),
    categoryId: z.string().min(1, t("validation.categoryRequired")),
    amount: z
      .string()
      .min(1, t("validation.amountRequired"))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t("validation.amountPositive"),
      }),
    tranactionDate: z.date(),
    status: z.string().min(1, t("validation.statusRequired")),
    description: z.string().optional(),
    note: z.string().optional(),
    imageUrl: z.string().optional(),
  }), [t]);

  const {
    control,
    register,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: String(TransactionType.Expense),
      categoryId: "",
      amount: "",
      tranactionDate: new Date(),
      status: String(PaymentStatus.Completed),
      description: "",
      note: "",
      imageUrl: "",
    },
  });

  const selectedType = watch("type");
  const tranactionDate = watch("tranactionDate");
  const watchedCategoryId = watch("categoryId");

  const lockAdvancedTransactionType = Boolean(
    transaction &&
      (transaction.type === TransactionType.Investment ||
        transaction.type === TransactionType.Savings)
  );

  useEffect(() => {
    if (!open) {
      setExpenseBudgetHint({ kind: "hidden" });
      return;
    }

    const typeNum = Number(selectedType);
    if (typeNum !== TransactionType.Expense) {
      setExpenseBudgetHint({ kind: "hidden" });
      return;
    }

    if (!(tranactionDate instanceof Date) || Number.isNaN(tranactionDate.getTime())) {
      setExpenseBudgetHint({ kind: "hidden" });
      return;
    }

    const monthLabel = formatBudgetMonthLabel(tranactionDate, i18n.language || "en");

    if (!watchedCategoryId) {
      setExpenseBudgetHint({ kind: "pick_category", monthLabel });
      return;
    }

    let cancelled = false;
    setExpenseBudgetHint({ kind: "loading" });

    void (async () => {
      try {
        const res = await budgetService.getBudgetContainingDate(
          format(tranactionDate, "yyyy-MM-dd")
        );
        if (cancelled) return;

        if (!res.budgetId) {
          setExpenseBudgetHint({ kind: "no_budget", monthLabel });
          return;
        }

        const rangeStart = (res.startDate ?? "").trim();
        const rangeEnd = (res.endDate ?? "").trim();
        if (
          rangeStart &&
          rangeEnd &&
          !isTransactionDayInBudgetPeriod(tranactionDate, rangeStart, rangeEnd)
        ) {
          const rangeLabel = formatBudgetRangeLabel(
            rangeStart,
            rangeEnd,
            dateFnsLocaleForLanguage(i18n.language)
          );
          setExpenseBudgetHint({ kind: "outside_period", monthLabel, rangeLabel });
          return;
        }

        const row = (res.categories ?? []).find((c) => c.categoryId === watchedCategoryId);
        if (!row) {
          setExpenseBudgetHint({ kind: "not_in_budget", monthLabel });
          return;
        }

        setExpenseBudgetHint({ kind: "ok", monthLabel, row });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setExpenseBudgetHint({ kind: "no_budget", monthLabel });
          return;
        }
        console.error(e);
        setExpenseBudgetHint({ kind: "hidden" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, selectedType, tranactionDate, watchedCategoryId, i18n.language]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pageSize: 999999999, // Fetch all categories for the dropdown
        });
        
        // Remove duplicates by categoryId - keep the latest version (ISO strings are sortable)
        const seen = new Map<string, ExpenseCategory>();
        (response.items || []).forEach(cat => {
          const existing = seen.get(cat.categoryId);
          if (!existing || (cat.updatedAt && existing.updatedAt && cat.updatedAt > existing.updatedAt) || (cat.updatedAt && !existing.updatedAt)) {
            seen.set(cat.categoryId, cat);
          }
        });
        
        setCategories(Array.from(seen.values()));
      } catch (error) {
        console.error("Failed to load categories for dialog:", error);
        toast.error(t("errors.categoriesLoadFailed"));
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open, t]);

  // Filter categories when transaction type changes
  useEffect(() => {
    const typeNum = Number(selectedType);
    if (selectedType && !isNaN(typeNum)) {
      const filtered = categories.filter((cat) => Number(cat.type) === typeNum);
      setFilteredCategories(filtered);
      
      // Reset category selection if current category doesn't match the new type
      const currentCategoryId = watch("categoryId");
      const isCurrentCategoryValid = filtered.some(
        (cat) => cat.categoryId === currentCategoryId
      );
      if (!isCurrentCategoryValid) {
        setValue("categoryId", "");
      }
    } else {
      setFilteredCategories([]);
    }
  }, [selectedType, categories, setValue, watch]);

  // Autofocus the amount input when opening in create mode for quick repeated entry
  useEffect(() => {
    if (open && !isEditMode) {
      const id = window.setTimeout(() => {
        amountInputRef.current?.focus();
      }, 80);
      return () => window.clearTimeout(id);
    }
  }, [open, isEditMode]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (transaction && transaction.tranactionId) {
        // Edit mode - has valid transaction ID
        reset({
          type: String(transaction.type),
          categoryId: transaction.categoryId,
          amount: String(transaction.amount),
          tranactionDate: new Date(transaction.tranactionDate),
          status: String(transaction.status),
          description: transaction.description || "",
          note: transaction.note || "",
          imageUrl: transaction.imageUrl || "",
        });
        setPreviewUrl(transaction.imageUrl || null);
      } else if (transaction && !transaction.tranactionId) {
        // Duplicate mode - has transaction data but no ID
        reset({
          type: String(transaction.type),
          categoryId: transaction.categoryId,
          amount: String(transaction.amount),
          tranactionDate: new Date(transaction.tranactionDate),
          status: String(transaction.status),
          description: transaction.description || "",
          note: transaction.note || "",
          imageUrl: transaction.imageUrl || "",
        });
        setPreviewUrl(transaction.imageUrl || null);
        setSelectedFile(null); // Clear any file selection for duplicate
      } else {
        // Create mode - no transaction
        reset({
          type: String(TransactionType.Expense),
          categoryId: "",
          amount: "",
          tranactionDate: new Date(),
          status: String(PaymentStatus.Completed),
          description: "",
          note: "",
          imageUrl: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  }, [open, transaction, reset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      toast.error(t("errors.invalidFileType"));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      toast.error(t("errors.fileTooLarge"));
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setValue('imageUrl', '');
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setUploading(true);

      let uploadedImageUrl = data.imageUrl;

      // Upload file to S3 if a new file is selected
      if (selectedFile) {
        try {
          const username = localStorage.getItem('username');
          const uploadResult = await s3Service.uploadReceipt(selectedFile, username || undefined);
          uploadedImageUrl = uploadResult.url;
        } catch (uploadError: any) {
          setUploading(false);
          console.error('Failed to upload receipt:', uploadError);
          toast.error(uploadError.message || t("errors.receiptUploadFailed"));
          return;
        }
      }

      const payload = {
        type: Number(data.type) as TransactionType,
        categoryId: data.categoryId,
        amount: Number(data.amount),
        tranactionDate: format(data.tranactionDate, "yyyy-MM-dd"),
        status: Number(data.status) as PaymentStatus,
        description: data.description?.trim() || "",
        note: data.note?.trim() || "",
        imageUrl: uploadedImageUrl?.trim() || "",
      };

      if (transaction && transaction.tranactionId) {
        // Update existing transaction (only if it has a valid ID)
        await transactionService.updateTransaction(transaction.tranactionId, payload);
        toast.success(t("transactions.addDialog.updateSuccess"));
      } else {
        // Create new transaction (for new or duplicated transactions)
        await transactionService.createTransaction(payload);
        toast.success(t("transactions.addDialog.createSuccess"));
      }
      onSuccess();

      const shouldAddAnother = addAnotherRef.current && !isEditMode;
      addAnotherRef.current = false;

      if (shouldAddAnother) {
        // Keep dialog open, keep type/category, clear amount + notes + receipt
        reset({
          type: data.type,
          categoryId: data.categoryId,
          amount: "",
          tranactionDate: data.tranactionDate,
          status: data.status,
          description: "",
          note: "",
          imageUrl: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        window.setTimeout(() => {
          amountInputRef.current?.focus();
        }, 50);
      } else {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      console.error('Error response:', error.message);
      toast.error(error.message || t("errors.transactionSaveFailed"));
    } finally {
      setUploading(false);
    }
  };

  const guardedOnOpenChange = useDirtyDialogGuard(isDirty, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={guardedOnOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction && transaction.tranactionId ? t("transactions.addDialog.editTitle") : t("transactions.addDialog.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {transaction && transaction.tranactionId
              ? t("transactions.addDialog.editDescription")
              : t("transactions.addDialog.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type (Expense & Income only; Investment/Savings stay read-only when editing) */}
          <div>
            <Label>{t("transactions.addDialog.typeLabel")}</Label>
            {lockAdvancedTransactionType ? (
              <div className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-sm">
                <span className="font-medium text-foreground">
                  {transaction!.type === TransactionType.Investment
                    ? t("transactions.type.investment")
                    : t("transactions.type.savings")}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("transactions.addDialog.typeLockedHint")}
                </p>
              </div>
            ) : (
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    <Label
                      htmlFor="add-tx-type-expense"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                        "has-data-[state=checked]:border-primary has-data-[state=checked]:shadow-[inset_0_0_0_1px] has-data-[state=checked]:shadow-primary/40"
                      )}
                    >
                      <RadioGroupItem
                        value={String(TransactionType.Expense)}
                        id="add-tx-type-expense"
                        className="sr-only"
                      />
                      <span>{t("transactions.type.expense")}</span>
                    </Label>
                    <Label
                      htmlFor="add-tx-type-income"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                        "has-data-[state=checked]:border-primary has-data-[state=checked]:shadow-[inset_0_0_0_1px] has-data-[state=checked]:shadow-primary/40"
                      )}
                    >
                      <RadioGroupItem
                        value={String(TransactionType.Income)}
                        id="add-tx-type-income"
                        className="sr-only"
                      />
                      <span>{t("transactions.type.income")}</span>
                    </Label>
                  </RadioGroup>
                )}
              />
            )}
            {!lockAdvancedTransactionType && errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <Label htmlFor="category">{t("transactions.addDialog.categoryLabel")}</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <CategoryCombobox
                    id="category"
                    value={field.value}
                    onChange={field.onChange}
                    categories={filteredCategories}
                    placeholder={
                      selectedType === ""
                        ? t("transactions.addDialog.selectTypeFirst")
                        : filteredCategories.length === 0
                        ? t("transactions.addDialog.noCategoriesForType")
                        : t("transactions.addDialog.categoryPlaceholder")
                    }
                    emptyHint={t("transactions.addDialog.noCategoriesForType")}
                    disabled={selectedType === "" || filteredCategories.length === 0}
                    invalid={!!errors.categoryId}
                    contentClassName="max-h-75"
                  />
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">{t("transactions.addDialog.amountLabel")}</Label>
              {(() => {
                const { ref: rhfRef, ...amountField } = register("amount");
                return (
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    ref={(el) => {
                      rhfRef(el);
                      amountInputRef.current = el;
                    }}
                    {...amountField}
                  />
                );
              })()}
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {Number(selectedType) === TransactionType.Expense && expenseBudgetHint.kind !== "hidden" && (
            <div className="rounded-lg border border-border bg-muted/35 px-3 py-2.5 text-sm">
              {expenseBudgetHint.kind === "loading" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  <span>{t("transactions.addDialog.budgetHintLoading")}</span>
                </div>
              )}
              {expenseBudgetHint.kind === "pick_category" && (
                <p className="text-muted-foreground">
                  {t("transactions.addDialog.budgetHintPickCategory", {
                    month: expenseBudgetHint.monthLabel,
                  })}
                </p>
              )}
              {expenseBudgetHint.kind === "no_budget" && (
                <p className="text-muted-foreground">
                  {t("transactions.addDialog.budgetHintNoPlan", { month: expenseBudgetHint.monthLabel })}{" "}
                  <Link to="/budget" className="font-medium text-primary underline underline-offset-2">
                    {t("transactions.addDialog.budgetHintOpenBudget")}
                  </Link>
                </p>
              )}
              {expenseBudgetHint.kind === "outside_period" && (
                <p className="text-muted-foreground">
                  {t("transactions.addDialog.budgetHintOutsidePeriod", {
                    range: expenseBudgetHint.rangeLabel,
                  })}{" "}
                  <Link to="/budget" className="font-medium text-primary underline underline-offset-2">
                    {t("transactions.addDialog.budgetHintOpenBudget")}
                  </Link>
                </p>
              )}
              {expenseBudgetHint.kind === "not_in_budget" && (
                <p className="text-muted-foreground">
                  {t("transactions.addDialog.budgetHintNotInPlan", { month: expenseBudgetHint.monthLabel })}{" "}
                  <Link to="/budget" className="font-medium text-primary underline underline-offset-2">
                    {t("transactions.addDialog.budgetHintOpenBudget")}
                  </Link>
                </p>
              )}
              {expenseBudgetHint.kind === "ok" && (
                <p className="text-foreground">
                  {t("transactions.addDialog.budgetHintOk", {
                    month: expenseBudgetHint.monthLabel,
                    allocated: formatCurrency(expenseBudgetHint.row.allocated, currency),
                    spent: formatCurrency(expenseBudgetHint.row.spent, currency),
                    remaining: formatCurrency(expenseBudgetHint.row.remaining, currency),
                    usage: String(Math.round(expenseBudgetHint.row.usagePercent)),
                  })}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Date */}
            <div>
              <Label>{t("transactions.addDialog.dateLabel")}</Label>
              <Controller
                name="tranactionDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t("transactions.addDialog.pickDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
              {errors.tranactionDate && (
                <p className="text-sm text-red-600">{errors.tranactionDate.message}</p>
              )}
            </div>

            {/* Payment Status */}
            <div>
              <Label htmlFor="status">{t("transactions.addDialog.statusLabel")}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t("transactions.addDialog.statusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(PaymentStatus.Completed)}>
                        {t("transactions.status.completed")}
                      </SelectItem>
                      <SelectItem value={String(PaymentStatus.Pending)}>
                        {t("transactions.status.pending")}
                      </SelectItem>
                      <SelectItem value={String(PaymentStatus.Failed)}>
                        {t("transactions.status.failed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t("transactions.addDialog.descriptionLabel")}</Label>
            <Input
              id="description"
              type="text"
              placeholder={t("transactions.addDialog.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">{t("transactions.addDialog.noteLabel")}</Label>
            <Input
              id="note"
              type="text"
              placeholder={t("transactions.addDialog.notePlaceholder")}
              {...register("note")}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <Label htmlFor="receipt">{t("transactions.addDialog.receiptLabel")}</Label>
            <div className="space-y-3">
              {/* File Input */}
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? t("transactions.addDialog.changeReceipt") : t("transactions.addDialog.uploadReceipt")}
                </Button>
              </div>

              {/* Preview or File Info */}
              {(selectedFile || previewUrl) && (
                <div className="relative border rounded-lg p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {previewUrl && previewUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-full h-32 object-contain rounded"
                    />
                  ) : selectedFile?.type === 'application/pdf' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                  ) : null}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {t("transactions.addDialog.receiptFormats")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => guardedOnOpenChange(false)}
              disabled={isSubmitting || uploading}
            >
              {t("common.cancel")}
            </Button>
            {!isEditMode && (
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting || uploading}
                onClick={() => {
                  addAnotherRef.current = true;
                }}
              >
                {t("transactions.addDialog.saveAndAddAnother")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              onClick={() => {
                addAnotherRef.current = false;
              }}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("transactions.addDialog.uploading")}
                </>
              ) : isSubmitting ? (
                t("transactions.addDialog.saving")
              ) : (
                t("transactions.addDialog.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
