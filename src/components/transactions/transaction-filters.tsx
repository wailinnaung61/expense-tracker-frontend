import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  CategoryCombobox,
  CATEGORY_COMBOBOX_ALL_VALUE,
} from "@/components/categories/category-combobox";
import { useTranslation } from "@/hooks/useTranslation";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, CategoryListParams } from "@/types/category";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dateFnsLocaleForLanguage } from "@/lib/budget-period";

interface TransactionFiltersProps {
  type: string;
  status: string;
  categoryId: string;
  keyword: string;
  startDate: string;
  endDate: string;
  onTypeChange: (newType: string) => void;
  onStatusChange: (newStatus: string) => void;
  onCategoryChange: (newCategoryId: string) => void;
  onKeywordChange: (newKeyword: string) => void;
  onStartDateChange: (newStartDate: string) => void;
  onEndDateChange: (newEndDate: string) => void;
  categoriesRefreshKey?: number;
}

export function TransactionFilters({
  type,
  status,
  categoryId,
  keyword,
  startDate,
  endDate,
  onTypeChange,
  onStatusChange,
  onCategoryChange,
  onKeywordChange,
  onStartDateChange,
  onEndDateChange,
  categoriesRefreshKey = 0,
}: TransactionFiltersProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = dateFnsLocaleForLanguage(i18n.language);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [startDateLocal, setStartDateLocal] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  );
  const [endDateLocal, setEndDateLocal] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  );
  const hasInvalidDateRange =
    !!startDateLocal &&
    !!endDateLocal &&
    startDateLocal.getTime() > endDateLocal.getTime();

  // Debounced keyword search: keep a local mirror, push to parent after 350 ms
  const [keywordLocal, setKeywordLocal] = useState(keyword);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local keyword if parent resets it externally (e.g., from URL)
  useEffect(() => {
    setKeywordLocal((current) => (current === keyword ? current : keyword));
  }, [keyword]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleKeywordInput = (value: string) => {
    setKeywordLocal(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onKeywordChange(value);
    }, 350);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDateLocal(date);
    onStartDateChange(date ? format(date, "yyyy-MM-dd") : "");
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDateLocal(date);
    onEndDateChange(date ? format(date, "yyyy-MM-dd") : "");
  };

  // Sync local state with props when they change externally
  useEffect(() => {
    setStartDateLocal(startDate ? new Date(startDate) : undefined);
  }, [startDate]);

  useEffect(() => {
    setEndDateLocal(endDate ? new Date(endDate) : undefined);
  }, [endDate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params: CategoryListParams = {
          pageSize: 100,
        };
        
        // Add type filter if not "all"
        if (type !== "all") {
          params.type = type;
        }
        
        const response = await categoryService.getCategories(params);
        
        // Remove duplicates by categoryId - keep the latest version (ISO strings are sortable)
        const seen = new Map<string, ExpenseCategory>();
        (response.items || []).forEach(cat => {
          const existing = seen.get(cat.categoryId);
          if (
            !existing ||
            (cat.updatedAt && existing.updatedAt && cat.updatedAt > existing.updatedAt) ||
            (cat.updatedAt && !existing.updatedAt)
          ) {
            seen.set(cat.categoryId, cat);
          }
        });
        
        const uniqueCategories = Array.from(seen.values());
        setCategories(uniqueCategories);
        
        // Clear selected category if it's not in the new filtered list
        if (categoryId && uniqueCategories.length > 0) {
          const categoryExists = uniqueCategories.some((cat: ExpenseCategory) => cat.categoryId === categoryId);
          if (!categoryExists) {
            onCategoryChange("all");
          }
        }
      } catch (error) {
        // Silent fail - categories will be empty array
        setCategories([]);
      }
    };
    fetchCategories();
  }, [type, categoriesRefreshKey, categoryId, onCategoryChange]);

  return (
    <div className="rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm sm:shadow-md">
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        {/* Search and Filters Row */}
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("transactions.filters.searchPlaceholder")}
              className="ps-10 h-11 border-muted-foreground/20 focus-visible:ring-2"
              value={keywordLocal}
              onChange={(e) => handleKeywordInput(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-nowrap">
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className="h-10 w-full border-muted-foreground/20 sm:h-11 sm:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.filters.allTypes")}</SelectItem>
                <SelectItem value="0">{t("transactions.type.income")}</SelectItem>
                <SelectItem value="1">{t("transactions.type.expense")}</SelectItem>
                <SelectItem value="2">{t("transactions.type.investment")}</SelectItem>
                <SelectItem value="3">{t("transactions.type.savings")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-10 w-full border-muted-foreground/20 sm:h-11 sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.filters.allStatus")}</SelectItem>
                <SelectItem value="0">{t("transactions.status.pending")}</SelectItem>
                <SelectItem value="1">{t("transactions.status.completed")}</SelectItem>
                <SelectItem value="2">{t("transactions.status.failed")}</SelectItem>
              </SelectContent>
            </Select>
            
            <CategoryCombobox
              value={categoryId === "all" ? CATEGORY_COMBOBOX_ALL_VALUE : categoryId}
              onChange={(next) => {
                onCategoryChange(
                  next === CATEGORY_COMBOBOX_ALL_VALUE ? "all" : next
                );
              }}
              categories={categories}
              includeAllOption
              allLabel={t("transactions.filters.allCategories")}
              placeholder={t("transactions.filters.allCategories")}
              triggerClassName="h-10 border-muted-foreground/20 sm:h-11 sm:w-40"
              contentClassName="max-h-100"
            />
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-full justify-start border-muted-foreground/20 text-left font-normal hover:bg-accent/50 sm:h-11 sm:w-64"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDateLocal ? (
                  <span className="font-medium">{format(startDateLocal, "PPP", { locale: dateLocale })}</span>
                ) : (
                  <span className="text-muted-foreground">{t("transactions.filters.startDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={startDateLocal}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-full justify-start border-muted-foreground/20 text-left font-normal hover:bg-accent/50 sm:h-11 sm:w-64"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDateLocal ? (
                  <span className="font-medium">{format(endDateLocal, "PPP", { locale: dateLocale })}</span>
                ) : (
                  <span className="text-muted-foreground">{t("transactions.filters.endDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={endDateLocal}
                onSelect={handleEndDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {hasInvalidDateRange && (
          <Alert className="border-amber-500/40 bg-amber-50 text-amber-900">
            <AlertTriangle className="text-amber-700" />
            <AlertTitle>{t("transactions.filters.invalidDateRangeTitle")}</AlertTitle>
            <AlertDescription>
              {t("transactions.filters.invalidDateRangeMessage")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
