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
  keyword: string;
  onStatusChange: (status: string) => void;
  onKeywordChange: (keyword: string) => void;
}

export function SavingsFilters({
  status,
  keyword,
  onStatusChange,
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
          </div>
        </div>
      </div>
    </div>
  );
}
