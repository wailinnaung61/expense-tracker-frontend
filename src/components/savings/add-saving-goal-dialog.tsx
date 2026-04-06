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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { savingsService } from "@/services/savingsService";
import { SavingGoalStatus, SavingGoalType } from "@/types/savings";
import type { SavingGoal } from "@/types/savings";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface AddSavingGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  goal?: SavingGoal | null;
}

const GOAL_ICONS = [
  "🎯", "🏠", "🚗", "✈️", "🎓", "💍", "🏖️", "💻", "📱", "🏥",
  "👶", "🐶", "🎁", "💰", "🏋️", "📚", "🎵", "⚽", "🛒", "☕",
];

const GOAL_COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a",
  "#059669", "#0d9488", "#0891b2", "#0284c7", "#2563eb", "#4f46e5",
  "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48",
];

type SavingGoalFormData = {
  goalName: string;
  targetAmount: string;
  targetDate: Date;
  savingGoalType: string;
  status?: string;
  description?: string;
  notes?: string;
  icon: string;
  color: string;
};

const STATUS_MAP: Record<string, number> = {
  ACTIVE: SavingGoalStatus.Active,
  COMPLETED: SavingGoalStatus.Completed,
  CANCELLED: SavingGoalStatus.Cancelled,
};

export function AddSavingGoalDialog({
  open,
  onOpenChange,
  onSuccess,
  goal,
}: AddSavingGoalDialogProps) {
  const { t } = useTranslation();

  const GOAL_TYPES = useMemo(() => [
    { value: String(SavingGoalType.EmergencyFund), label: t("savings.goalTypes.emergencyFund") },
    { value: String(SavingGoalType.Vacation), label: t("savings.goalTypes.vacation") },
    { value: String(SavingGoalType.Vehicle), label: t("savings.goalTypes.vehicle") },
    { value: String(SavingGoalType.Home), label: t("savings.goalTypes.home") },
    { value: String(SavingGoalType.Education), label: t("savings.goalTypes.education") },
    { value: String(SavingGoalType.Retirement), label: t("savings.goalTypes.retirement") },
    { value: String(SavingGoalType.Other), label: t("savings.goalTypes.other") },
  ], [t]);

  const goalSchema = useMemo(
    () =>
      z.object({
        goalName: z
          .string()
          .min(1, t("savings.validation.goalNameRequired"))
          .max(200, t("savings.validation.goalNameMax")),
        targetAmount: z
          .string()
          .min(1, t("savings.validation.targetAmountRequired"))
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: t("savings.validation.targetAmountPositive"),
          }),
        targetDate: z.date(),
        savingGoalType: z.string().min(1),
        status: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        icon: z.string().min(1),
        color: z.string().min(1),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SavingGoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalName: "",
      targetAmount: "",
      targetDate: new Date(),
      savingGoalType: String(SavingGoalType.EmergencyFund),
      status: String(SavingGoalStatus.Active),
      description: "",
      notes: "",
      icon: "🎯",
      color: "#2563eb",
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const goalName = watch("goalName");

  const normalizeGoalType = (value?: string) => {
    if (!value) return String(SavingGoalType.Other);
    const normalized = value.trim();
    const match = GOAL_TYPES.find(
      (type) => type.value.toLowerCase() === normalized.toLowerCase()
    );
    return match?.value ?? String(SavingGoalType.Other);
  };

  useEffect(() => {
    const existingGoalType = normalizeGoalType(
      (goal as any)?.savingGoalType ?? (goal as any)?.SavingGoalType ?? (goal as any)?.goalType ?? (goal as any)?.GoalType
    );

    if (goal) {
      reset({
        goalName: goal.goalName,
        targetAmount: String(goal.targetAmount),
        targetDate: new Date(goal.targetDate),
        savingGoalType: existingGoalType,
        status: String(STATUS_MAP[goal.status.toUpperCase()] ?? SavingGoalStatus.Active),
        description: goal.description || "",
        notes: goal.notes || "",
        icon: goal.icon || "🎯",
        color: goal.color || "#2563eb",
      });
    } else {
      reset({
        goalName: "",
        targetAmount: "",
        targetDate: new Date(),
        savingGoalType: String(SavingGoalType.EmergencyFund),
        status: String(SavingGoalStatus.Active),
        description: "",
        notes: "",
        icon: "🎯",
        color: "#2563eb",
      });
    }
  }, [goal, open, reset]);

  const onSubmit = async (data: SavingGoalFormData) => {
    try {
      if (goal) {
        await savingsService.updateGoal(goal.savingGoalId, {
          goalName: data.goalName.trim(),
          targetAmount: Number(data.targetAmount),
          targetDate: format(data.targetDate, "yyyy-MM-dd"),
          savingGoalType: data.savingGoalType || String(SavingGoalType.Other),
          status: Number(data.status) as SavingGoalStatus,
          description: data.description || "",
          notes: data.notes || "",
          icon: data.icon || "",
          color: data.color || "",
        });
        toast.success(t("savings.feedback.updated"));
      } else {
        await savingsService.createGoal({
          goalName: data.goalName.trim(),
          targetAmount: Number(data.targetAmount),
          targetDate: format(data.targetDate, "yyyy-MM-dd"),
          savingGoalType: data.savingGoalType || String(SavingGoalType.Other),
          description: data.description || "",
          notes: data.notes || "",
          icon: data.icon || "",
          color: data.color || "",
        });
        toast.success(t("savings.feedback.created"));
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Failed to save saving goal:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {goal ? t("savings.dialog.editTitle") : t("savings.dialog.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {goal ? t("savings.dialog.editDescription") : t("savings.dialog.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="goalName">{t("savings.dialog.goalName")} *</Label>
            <Input
              id="goalName"
              placeholder={t("savings.dialog.goalNamePlaceholder")}
              {...register("goalName")}
            />
            {errors.goalName && (
              <p className="text-sm text-red-600">{errors.goalName.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("savings.dialog.description")}</Label>
            <Input
              id="description"
              placeholder={t("savings.dialog.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <Label>{t("savings.dialog.goalType")}</Label>
            <Controller
              name="savingGoalType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("savings.dialog.selectGoalType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.savingGoalType && (
              <p className="text-sm text-red-600">{t("savings.validation.goalTypeRequired")}</p>
            )}
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount">{t("savings.dialog.targetAmount")} *</Label>
            <Input
              id="targetAmount"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("targetAmount")}
            />
            {errors.targetAmount && (
              <p className="text-sm text-red-600">{errors.targetAmount.message}</p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>{t("savings.dialog.targetDate")} *</Label>
            <Controller
              name="targetDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
            {errors.targetDate && (
              <p className="text-sm text-red-600">{errors.targetDate.message}</p>
            )}
          </div>

          {/* Status (edit only) */}
          {goal && (
            <div className="space-y-2">
              <Label>{t("savings.dialog.status")}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("savings.dialog.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(SavingGoalStatus.Active)}>
                        {t("savings.filters.active")}
                      </SelectItem>
                      <SelectItem value={String(SavingGoalStatus.Completed)}>
                        {t("savings.filters.completed")}
                      </SelectItem>
                      <SelectItem value={String(SavingGoalStatus.Cancelled)}>
                        {t("savings.filters.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>{t("savings.dialog.icon")}</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 sm:gap-2">
                    {GOAL_ICONS.map((iconOption) => (
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
                  <Input
                    placeholder={t("savings.dialog.iconPlaceholder")}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    maxLength={2}
                    className="w-full"
                  />
                </div>
              )}
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>{t("savings.dialog.color")}</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2">
                  {GOAL_COLORS.map((colorOption) => (
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
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t("savings.dialog.preview")}</Label>
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <span className="text-2xl">{selectedIcon}</span>
              <span className="font-medium" style={{ color: selectedColor }}>
                {goalName || t("savings.dialog.goalName")}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("savings.dialog.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("savings.dialog.notesPlaceholder")}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("savings.dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("savings.dialog.saving") : goal ? t("savings.dialog.update") : t("savings.dialog.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
