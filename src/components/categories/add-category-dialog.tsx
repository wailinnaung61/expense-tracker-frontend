import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, TransactionType } from "@/types/category";
import { TransactionType as TransactionTypeEnum } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  category?: ExpenseCategory | null;
}

const CATEGORY_ICONS = [
  "🏠", "🍔", "🚗", "🎬", "🛒", "💡", "💰", "📱", "✈️", "🏥",
  "📚", "👕", "⚽", "🎵", "🎨", "💳", "☕", "🎁", "💼", "🏋️"
];

const CATEGORY_COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a",
  "#059669", "#0d9488", "#0891b2", "#0284c7", "#2563eb", "#4f46e5",
  "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48"
];

const categorySchema = z.object({
  displayName: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must not exceed 50 characters"),
  type: z.string().min(1, "Type is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
}: AddCategoryDialogProps) {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      displayName: "",
      type: String(TransactionTypeEnum.Expense),
      icon: "💰",
      color: "#3b82f6",
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const displayName = watch("displayName");

  useEffect(() => {
    if (category) {
      reset({
        displayName: category.displayName,
        type: String(category.type),
        icon: category.icon,
        color: category.color,
      });
    } else {
      reset({
        displayName: "",
        type: String(TransactionTypeEnum.Expense),
        icon: "💰",
        color: "#3b82f6",
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        // Update existing category
        await categoryService.updateCategory(category.categoryId, {
          displayName: data.displayName.trim(),
          icon: data.icon,
          color: data.color,
        });
        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: t('categories.updateSuccessMessage'),
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Create new category
        await categoryService.createCategory({
          displayName: data.displayName.trim(),
          type: Number(data.type) as TransactionType,
          icon: data.icon,
          color: data.color,
        });
        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: t('categories.createSuccessMessage'),
          timer: 2000,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? t('categories.editCategory') : t('categories.addCategory')}
          </DialogTitle>
          <DialogDescription>
            {category ? t('categories.editDescription') : t('categories.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('categories.categoryName')} *</Label>
            <Input
              id="name"
              placeholder={t('categories.categoryNamePlaceholder')}
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          {/* Transaction Type - only show for new categories */}
          {!category && (
            <div className="space-y-2">
              <Label htmlFor="type">{t('categories.categoryType')} *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder={t('categories.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(TransactionTypeEnum.Income)}>
                        {t('categories.income')}
                      </SelectItem>
                      <SelectItem value={String(TransactionTypeEnum.Expense)}>
                        {t('categories.expense')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          )}

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>{t('categories.icon')} *</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 sm:gap-2">
                  {CATEGORY_ICONS.map((iconOption) => (
                    <button
                      key={iconOption}
                      type="button"
                      onClick={() => field.onChange(iconOption)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl rounded-lg border-2 hover:border-primary hover:bg-accent transition-all ${
                        selectedIcon === iconOption
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-border"
                      }`}
                    >
                      {iconOption}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.icon && (
              <p className="text-sm text-red-600">{errors.icon.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>{t('categories.color')} *</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2">
                  {CATEGORY_COLORS.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => field.onChange(colorOption)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === colorOption
                          ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: colorOption }}
                    />
                  ))}
                </div>
              )}
            />
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('categories.preview')}</Label>
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <span className="text-2xl">{selectedIcon}</span>
              <span className="font-medium" style={{ color: selectedColor }}>
                {displayName || t('categories.categoryName')}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('categories.saving') : category ? t('categories.update') : t('categories.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
