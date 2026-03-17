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
import { transactionService } from "@/services/tranactionService";
import { s3Service } from "@/services/s3Service";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { PaymentStatus } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, FileIcon, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

const transactionSchema = z.object({
  type: z.string().min(1, "Type is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  tranactionDate: z.date(),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  imageUrl: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

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
          pagination: {
            pageNumber: 1,
            pageSize: 100,
          },
        });
       setCategories(response.items || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
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
      if (transaction) {
        // Edit mode
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
      } else {
        // Create mode
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
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please select an image (JPEG, PNG, GIF, WebP) or PDF file',
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 5MB',
      });
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
          const userId = localStorage.getItem('userId');
          const uploadResult = await s3Service.uploadReceipt(selectedFile, userId || undefined);
          uploadedImageUrl = uploadResult.url;
        } catch (uploadError: any) {
          setUploading(false);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: uploadError.message || 'Failed to upload receipt image',
          });
          return;
        }
      }

      const payload = {
        type: Number(data.type) as TransactionType,
        categoryId: data.categoryId,
        amount: Number(data.amount),
        tranactionDate: data.tranactionDate.toISOString(),
        status: Number(data.status) as PaymentStatus,
        description: data.description?.trim() || undefined,
        note: data.note?.trim() || undefined,
        imageUrl: uploadedImageUrl?.trim() || undefined,
      };

      if (transaction) {
        // Update existing transaction
        await transactionService.updateTransaction(transaction.tranactionId, payload);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Transaction updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Create new transaction
        await transactionService.createTransaction(payload);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Transaction created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save transaction",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update the transaction details below"
              : "Fill in the details to add a new transaction"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <Label>Transaction Type</Label>
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
                      <span>Expense</span>
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
                      <span>Income</span>
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
              <Label htmlFor="category">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-75">
                      {selectedType === "" ? (
                        <div className="p-4 text-sm text-gray-500">
                          Please select a transaction type first
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">
                          No categories available for this type
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
              <Label htmlFor="amount">Amount</Label>
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
              <Label>Transaction Date</Label>
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
                          <span>Pick a date</span>
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
              <Label htmlFor="status">Payment Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(PaymentStatus.Completed)}>
                        Completed
                      </SelectItem>
                      <SelectItem value={String(PaymentStatus.Pending)}>
                        Pending
                      </SelectItem>
                      <SelectItem value={String(PaymentStatus.Failed)}>
                        Failed
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Enter description"
              {...register("description")}
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              type="text"
              placeholder="Additional notes"
              {...register("note")}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <Label htmlFor="receipt">Receipt (Optional)</Label>
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
                  {selectedFile ? 'Change Receipt' : 'Upload Receipt'}
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
                Supports: JPEG, PNG, GIF, WebP, PDF (Max 5MB)
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : isSubmitting ? (
                "Saving..."
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
