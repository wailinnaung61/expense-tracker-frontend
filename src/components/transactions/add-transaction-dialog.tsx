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
import { categoryService } from "@/services/categoryService";
import { transactionService } from "@/services/transactionService";
import { s3Service } from "@/services/s3Service";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { PaymentStatus } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, FileIcon, Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
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
}: AddTransactionDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ExpenseCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

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
    formState: { errors, isSubmitting },
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
        // Silent fail - categories will be  empty array
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Filter categories when transaction type changes
  useEffect(() => {
    const typeNum = Number(selectedType);
    if (selectedType && !isNaN(typeNum)) {
      const filtered = categories.filter((cat) => cat.type === typeNum);
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
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
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
          toast.error(uploadError.message || 'Failed to upload receipt');
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
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      console.error('Error response:', error.message);
      toast.error(error.message || 'Failed to save transaction. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {/* Transaction Type */}
          <div>
            <Label>{t("transactions.addDialog.typeLabel")}</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  <div>
                    <RadioGroupItem
                      value={String(TransactionType.Expense)}
                      id="expense"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="expense"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span>{t("transactions.type.expense")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={String(TransactionType.Income)}
                      id="income"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="income"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span>{t("transactions.type.income")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={String(TransactionType.Investment)}
                      id="investment"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="investment"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span>{t("transactions.type.investment")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={String(TransactionType.Savings)}
                      id="savings"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="savings"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span>{t("transactions.type.savings")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.type && (
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("transactions.addDialog.categoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-75">
                      {selectedType === "" ? (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          {t("transactions.addDialog.selectTypeFirst")}
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          {t("transactions.addDialog.noCategoriesForType")}
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            <div className="flex items-center gap-2" style={{ color: category.color }}>
                              <span className="text-lg">
                                {category.icon}
                              </span>
                              <span>{category.displayName}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">{t("transactions.addDialog.amountLabel")}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>

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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || uploading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
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
