import { Button } from "@/components/ui/button";
import { AmountFieldCalculatorTrigger } from "@/components/calculator/amount-field-calculator-trigger";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { transactionService } from "@/services/transactionService";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType, PaymentStatus } from "@/types/transaction";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  Plus,
  Trash2,
  Copy,
  CopyPlus,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";
import { dateFnsLocaleForLanguage } from "@/lib/budget-period";

interface BulkAddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface TransactionRow {
  id: string;
  type: number;
  categoryId: string;
  amount: string;
  date: Date;
  status: number;
  description: string;
  note: string;
}

interface RowErrors {
  categoryId?: string;
  amount?: string;
}

export function BulkAddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkAddTransactionDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [rows, setRows] = useState<TransactionRow[]>([
    {
      id: crypto.randomUUID(),
      type: TransactionType.Expense,
      categoryId: "",
      amount: "",
      date: new Date(),
      status: PaymentStatus.Completed,
      description: "",
      note: "",
    },
  ]);
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const amountInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { t, i18n } = useTranslation();
  const dateLocale = dateFnsLocaleForLanguage(i18n.language);

  const transactionRowSchema = useMemo(() => z.object({
    categoryId: z.string().min(1, t("validation.categoryRequired")),
    amount: z.string()
      .min(1, t("validation.amountRequired"))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t("validation.amountPositive"),
      }),
  }), [t]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pageSize: 999999999,
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
        // Handle error (optional)
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setRows([
        {
          id: crypto.randomUUID(),
          type: TransactionType.Expense,
          categoryId: "",
          amount: "",
          date: new Date(),
          status: PaymentStatus.Completed,
          description: "",
          note: "",
        },
      ]);
      setRowErrors({});
    }
  }, [open]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        type: TransactionType.Expense,
        categoryId: "",
        amount: "",
        date: new Date(),
        status: PaymentStatus.Completed,
        description: "",
        note: "",
      },
    ]);
  };

  const duplicateLastRow = () => {
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const newId = crypto.randomUUID();
      setRows([
        ...rows,
        {
          id: newId,
          type: lastRow.type,
          categoryId: lastRow.categoryId,
          amount: "", // Empty amount for new entry
          date: new Date(),
          status: lastRow.status,
          description: lastRow.description,
          note: lastRow.note,
        },
      ]);
      // Focus on amount input after row is added
      setTimeout(() => {
        amountInputRefs.current[newId]?.focus();
      }, 100);
    }
  };

  const copyFromAbove = (currentIndex: number) => {
    if (currentIndex > 0) {
      const previousRow = rows[currentIndex - 1];
      const currentRowId = rows[currentIndex].id;
      updateMultipleFields(currentRowId, {
        type: previousRow.type,
        categoryId: previousRow.categoryId,
        status: previousRow.status,
        description: previousRow.description,
        note: previousRow.note,
      });
      // Focus on amount input
      setTimeout(() => {
        amountInputRefs.current[currentRowId]?.focus();
      }, 100);
    }
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
      setRowErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    setRows((currentRows) => {
      const nextRows = [...currentRows];
      [nextRows[index], nextRows[targetIndex]] = [
        nextRows[targetIndex],
        nextRows[index],
      ];
      return nextRows;
    });
  };

  const clearFieldErrors = (id: string, fields: (keyof RowErrors)[]) => {
    setRowErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[id]) {
        fields.forEach((field) => delete newErrors[id][field]);
        if (Object.keys(newErrors[id]).length === 0) {
          delete newErrors[id];
        }
      }
      return newErrors;
    });
  };

  const updateRow = (id: string, field: keyof TransactionRow, value: any) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    if (field === "categoryId" || field === "amount") {
      clearFieldErrors(id, [field]);
    }
  };

  const updateMultipleFields = (id: string, updates: Partial<TransactionRow>) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
    const errorFields = (Object.keys(updates) as (keyof TransactionRow)[]).filter(
      (f) => f === "categoryId" || f === "amount"
    ) as (keyof RowErrors)[];
    if (errorFields.length > 0) {
      clearFieldErrors(id, errorFields);
    }
  };

  const getFilteredCategories = (type: number) => {
    return categories.filter((cat) => cat.type === type);
  };

  const handleSubmit = async () => {
    // Validate all rows using Zod
    const newErrors: Record<string, RowErrors> = {};
    let hasErrors = false;

    rows.forEach((row) => {
      const result = transactionRowSchema.safeParse({
        categoryId: row.categoryId,
        amount: row.amount,
      });

      if (!result.success) {
        const rowErrors: RowErrors = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RowErrors;
          rowErrors[field] = issue.message;
        });
        newErrors[row.id] = rowErrors;
        hasErrors = true;
      }
    });

    setRowErrors(newErrors);

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create in row order (top → bottom) so list order matches what the user entered.
      // Parallel create races and can insert in random order.
      for (const row of rows) {
        await transactionService.createTransaction({
          type: row.type as TransactionType,
          categoryId: row.categoryId,
          amount: Number(row.amount),
          tranactionDate: format(row.date, "yyyy-MM-dd"),
          status: row.status as PaymentStatus,
          description: row.description?.trim() || "",
          note: row.note?.trim() || "",
          imageUrl: "",
        });
      }

      toast.success(t("transactions.bulkAdd.createSuccess", { count: rows.length }));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create transactions:', error);
      toast.error(error.message || 'Failed to create transactions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw]! w-[90vw]! max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="sticky top-0 bg-background pb-4 pt-6 px-6 z-20">
          <DialogTitle>{t("transactions.bulkAdd.title")}</DialogTitle>
          <DialogDescription>
            {t("transactions.bulkAdd.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md mx-4">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                <th className="text-left p-2 text-sm font-semibold w-12">#</th>
                <th className="text-left p-2 text-sm font-semibold w-28">{t("transactions.bulkAdd.colType")}</th>
                <th className="text-left p-2 text-sm font-semibold w-48">{t("transactions.bulkAdd.colCategory")}</th>
                <th className="text-left p-2 text-sm font-semibold w-28">{t("transactions.bulkAdd.colAmount")}</th>
                <th className="text-left p-2 text-sm font-semibold w-36">{t("transactions.bulkAdd.colDate")}</th>
                <th className="text-left p-2 text-sm font-semibold w-32">{t("transactions.bulkAdd.colStatus")}</th>
                <th className="text-left p-2 text-sm font-semibold w-48">{t("transactions.bulkAdd.colDescription")}</th>
                <th className="text-left p-2 text-sm font-semibold w-48">{t("transactions.bulkAdd.colNote")}</th>
                <th className="text-center p-2 text-sm font-semibold w-40">{t("transactions.bulkAdd.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
                  {/* Row Number */}
                  <td className="p-2">
                    <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  </td>

                  {/* Type */}
                  <td className="p-2">
                    <Select
                      value={String(row.type)}
                      onValueChange={(value) => {
                        updateMultipleFields(row.id, {
                          type: Number(value),
                          categoryId: "", // Clear category when type changes
                        });
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value={String(TransactionType.Expense)}>
                          <span className="flex items-center gap-2">
                            <span className="text-red-600">−</span>
                            <span>{t("transactions.type.expense")}</span>
                          </span>
                        </SelectItem>
                        <SelectItem value={String(TransactionType.Income)}>
                          <span className="flex items-center gap-2">
                            <span className="text-green-600">+</span>
                            <span>{t("transactions.type.income")}</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Category */}
                  <td className="p-2">
                    <div>
                      <CategoryCombobox
                        value={row.categoryId}
                        onChange={(value) => updateRow(row.id, "categoryId", value)}
                        categories={getFilteredCategories(row.type)}
                        placeholder={t("transactions.bulkAdd.categoryPlaceholder")}
                        emptyHint={t("transactions.bulkAdd.noCategories")}
                        invalid={!!rowErrors[row.id]?.categoryId}
                        triggerClassName="h-9"
                        contentClassName="max-h-60 max-w-75"
                      />
                      {rowErrors[row.id]?.categoryId && (
                        <p className="text-xs text-destructive mt-1">{rowErrors[row.id].categoryId}</p>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="p-2">
                    <div>
                      <div className="flex gap-1">
                        <Input
                          ref={(el) => { amountInputRefs.current[row.id] = el; }}
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={row.amount}
                          onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                          className={`h-9 flex-1 ${rowErrors[row.id]?.amount ? 'border-destructive' : ''}`}
                        />
                        <AmountFieldCalculatorTrigger
                          onApply={(v) => updateRow(row.id, "amount", v)}
                          className="h-9 w-9 shrink-0"
                        />
                      </div>
                      {rowErrors[row.id]?.amount && (
                        <p className="text-xs text-destructive mt-1">{rowErrors[row.id].amount}</p>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-9 w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(row.date, "MMM dd", { locale: dateLocale })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={row.date}
                          onSelect={(date) => updateRow(row.id, "date", date || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </td>

                  {/* Status */}
                  <td className="p-2">
                    <Select
                      value={String(row.status)}
                      onValueChange={(value) => updateRow(row.id, "status", Number(value))}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value={String(PaymentStatus.Completed)}>{t("transactions.status.completed")}</SelectItem>
                        <SelectItem value={String(PaymentStatus.Pending)}>{t("transactions.status.pending")}</SelectItem>
                        <SelectItem value={String(PaymentStatus.Failed)}>{t("transactions.status.failed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Description */}
                  <td className="p-2">
                    <Input
                      placeholder={t("transactions.bulkAdd.descriptionPlaceholder")}
                      value={row.description}
                      onChange={(e) => updateRow(row.id, "description", e.target.value)}
                      className="h-9"
                    />
                  </td>

                  {/* Note */}
                  <td className="p-2">
                    <Input
                      placeholder={t("transactions.bulkAdd.notePlaceholder")}
                      value={row.note}
                      onChange={(e) => updateRow(row.id, "note", e.target.value)}
                      className="h-9"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveRow(index, -1)}
                        disabled={index === 0}
                        className="h-8 w-8"
                        title={t("transactions.bulkAdd.moveUp")}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveRow(index, 1)}
                        disabled={index === rows.length - 1}
                        className="h-8 w-8"
                        title={t("transactions.bulkAdd.moveDown")}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => copyFromAbove(index)}
                          className="h-8 w-8 hover:bg-primary/10"
                          title={t("transactions.bulkAdd.copyFromAbove")}
                        >
                          <Copy className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        className="h-8 w-8 hover:bg-destructive/10"
                          title={t("transactions.bulkAdd.deleteRow")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Actions */}
        <div className="border-t bg-background px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            {/* Left side - Row management */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("transactions.bulkAdd.addRow")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={duplicateLastRow}
                disabled={rows.length === 0}
                className="gap-2"
              >
                <CopyPlus className="h-4 w-4" />
                {t("transactions.bulkAdd.duplicateLast")}
              </Button>
            </div>

            {/* Right side - Form actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || rows.length === 0}>
                {isSubmitting ? t("transactions.bulkAdd.creating") : t("transactions.bulkAdd.createButton", { count: rows.length })}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("transactions.bulkAdd.tip")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
