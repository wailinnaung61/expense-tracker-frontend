import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Search } from "lucide-react";

interface SavingsFiltersProps {
  status: string;
  goalType: string;
  keyword: string;
  onStatusChange: (status: string) => void;
  onGoalTypeChange: (goalType: string) => void;
  onKeywordChange: (keyword: string) => void;
}

export function SavingsFilters({
  status,
  goalType,
  keyword,
  onStatusChange,
  onGoalTypeChange,
  onKeywordChange,
}: SavingsFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-md">
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("savings.filters.searchPlaceholder")}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="ps-10 h-11 border-muted-foreground/20 focus-visible:ring-2"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-44 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("savings.filters.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("savings.filters.allStatus")}</SelectItem>
                <SelectItem value="0">{t("savings.filters.active")}</SelectItem>
                <SelectItem value="1">{t("savings.filters.completed")}</SelectItem>
                <SelectItem value="2">{t("savings.filters.cancelled")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={goalType} onValueChange={onGoalTypeChange}>
              <SelectTrigger className="w-full sm:w-44 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("savings.filters.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("savings.filters.allTypes")}</SelectItem>
                <SelectItem value="EmergencyFund">{t("savings.goalTypes.emergencyFund")}</SelectItem>
                <SelectItem value="Vacation">{t("savings.goalTypes.vacation")}</SelectItem>
                <SelectItem value="Vehicle">{t("savings.goalTypes.vehicle")}</SelectItem>
                <SelectItem value="Home">{t("savings.goalTypes.home")}</SelectItem>
                <SelectItem value="Education">{t("savings.goalTypes.education")}</SelectItem>
                <SelectItem value="Retirement">{t("savings.goalTypes.retirement")}</SelectItem>
                <SelectItem value="Other">{t("savings.goalTypes.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
