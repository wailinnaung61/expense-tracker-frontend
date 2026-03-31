import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { TransactionType } from "@/types/category";
import { Search } from "lucide-react";

interface CategoryFiltersProps {
  type: string;
  keyword: string;
  onTypeChange: (type: string) => void;
  onKeywordChange: (keyword: string) => void;
}

export function CategoryFilters({
  type,
  keyword,
  onTypeChange,
  onKeywordChange,
}: CategoryFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-md">
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("categories.searchCategories")}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="ps-10 h-11 border-muted-foreground/20 focus-visible:ring-2"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full sm:w-48 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("categories.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("categories.allTypes")}</SelectItem>
                <SelectItem value={String(TransactionType.Income)}>{t("categories.income")}</SelectItem>
                <SelectItem value={String(TransactionType.Expense)}>{t("categories.expense")}</SelectItem>
                <SelectItem value={String(TransactionType.Investment)}>{t("categories.investment")}</SelectItem>
                <SelectItem value={String(TransactionType.Savings)}>{t("categories.savings")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
