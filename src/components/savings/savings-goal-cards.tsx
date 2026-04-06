import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { savingsService } from "@/services/savingsService";
import { formatCurrency } from "@/lib/utils";
import type { SavingGoal } from "@/types/savings";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreVertical,
  Trash2,
  CircleDollarSign,
  CircleDot,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface SavingsGoalCardsProps {
  goals: SavingGoal[];
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onEdit: (goal: SavingGoal) => void;
  onDelete: () => void;
  onContribute: (goal: SavingGoal) => void;
  currency?: string;
}

const getStatusBadgeClass = (status: string): string => {
  const s = status.toUpperCase();
  if (s === "ACTIVE")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "COMPLETED")
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "CANCELLED")
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
};

const translateGoalType = (goalType: string, t: any): string => {
  const typeMap: Record<string, string> = {
    'EmergencyFund': 'savings.goalTypes.emergencyFund',
    'Vacation': 'savings.goalTypes.vacation',
    'Vehicle': 'savings.goalTypes.vehicle',
    'Home': 'savings.goalTypes.home',
    'Education': 'savings.goalTypes.education',
    'Retirement': 'savings.goalTypes.retirement',
    'Other': 'savings.goalTypes.other',
  };
  return t(typeMap[goalType] || 'savings.goalTypes.other');
};

const translateStatus = (status: string, t: any): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'savings.status.active',
    'COMPLETED': 'savings.status.completed',
    'CANCELLED': 'savings.status.cancelled',
  };
  return t(statusMap[status.toUpperCase()] || status);
};

const getGoalTypeValue = (goal: any) => {
  return (
    goal.savingGoalType ?? goal.SavingGoalType ?? goal.goalType ?? goal.GoalType ?? ""
  );
};

export function SavingsGoalCards({
  goals,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onEdit,
  onDelete,
  onContribute,
  currency = "USD",
}: SavingsGoalCardsProps) {
  const { t } = useTranslation();

  const handleDelete = async (goalId: string) => {
    const result = await Swal.fire({
      title: t("savings.feedback.confirmDeleteTitle"),
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
        await savingsService.deleteGoal(goalId);
        toast.success(t("savings.feedback.deleted"));
        onDelete();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : t("savings.feedback.deleteFailed")
        );
      }
    }
  };

  if (goals.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">{t("savings.goals.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progressCapped = Math.min(goal.progressPercentage, 100);
          const isCompleted = goal.status.toUpperCase() === "COMPLETED";
          const isCancelled = goal.status.toUpperCase() === "CANCELLED";
          const goalColor = goal.color || "#10b981";

          return (
            <div
              key={goal.savingGoalId}
              className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
            >
              {/* Color accent bar */}
              <div
                className="h-1"
                style={{ background: `linear-gradient(90deg, ${goalColor}, ${goalColor}88)` }}
              />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${goalColor}20, ${goalColor}10)`,
                        border: `1px solid ${goalColor}25`,
                      }}
                    >
                      {goal.icon ? (
                        <span className="text-lg">{goal.icon}</span>
                      ) : (
                        <CircleDot className="h-5 w-5" style={{ color: goalColor }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold truncate">{goal.goalName}</h3>
                        {getGoalTypeValue(goal) && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                            {translateGoalType(getGoalTypeValue(goal), t)}
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(goal.status)}`}
                    >
                      {translateStatus(goal.status, t)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isCompleted && !isCancelled && (
                          <DropdownMenuItem onClick={() => onContribute(goal)}>
                            <CircleDollarSign className="mr-2 h-4 w-4" />
                            {t("savings.goals.contribute")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(goal)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("savings.goals.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(goal.savingGoalId)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("savings.goals.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold" style={{ color: goalColor }}>
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressCapped}%`,
                        background: isCompleted
                          ? "linear-gradient(90deg, #10b981, #059669)"
                          : `linear-gradient(90deg, ${goalColor}, ${goalColor}cc)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      {goal.progressPercentage.toFixed(1)}% {t("savings.goals.reached")}
                    </span>
                    <span>
                      {formatCurrency(goal.remainingAmount, currency)} {t("savings.goals.remaining")}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed">
                  <span className="text-xs text-muted-foreground">
                    {t("savings.goals.targetDate")}: {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                  </span>
                  {!isCompleted && !isCancelled && (
                    <Button
                      size="sm"
                      className="h-7 text-xs px-3 text-white"
                      style={{ background: goalColor }}
                      onClick={() => onContribute(goal)}
                    >
                      <CircleDollarSign className="mr-1 h-3 w-3" />
                      {t("savings.goals.contribute")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {(hasNextPage || hasPreviousPage) && (
        <div className="flex flex-wrap justify-between items-center">
          <span className="text-sm text-muted-foreground mb-1 md:mb-0">
            {t("savings.goals.pagination", { current: currentPage, count: totalCount })}
          </span>
          <div className="flex gap-2">
            {hasPreviousPage && (
              <Button variant="outline" size="sm" onClick={onPreviousPage} className="px-3 py-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.previous")}
              </Button>
            )}
            {hasNextPage && (
              <Button variant="outline" size="sm" onClick={onNextPage} className="px-3 py-2">
                {t("common.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
