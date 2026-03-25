import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
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
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, CategoryListParams } from "@/types/category";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { useEffect, useState } from "react";

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
}: TransactionFiltersProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [startDateLocal, setStartDateLocal] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  );
  const [endDateLocal, setEndDateLocal] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  );

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
          if (!existing || cat.updatedAt > existing.updatedAt) {
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
  }, [type]);

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-md">
      <div className="p-6 space-y-5">
        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search transactions..."
              className="ps-10 h-11 border-muted-foreground/20 focus-visible:ring-2"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full sm:w-36 h-11 border-muted-foreground/20">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="0">Income</SelectItem>
                <SelectItem value="1">Expense</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-36 h-11 border-muted-foreground/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Completed</SelectItem>
                <SelectItem value="2">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryId} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-40 h-11 border-muted-foreground/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="max-h-100">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.icon} {cat.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-64 h-11 justify-start text-left font-normal border-muted-foreground/20 hover:bg-accent/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDateLocal ? (
                  <span className="font-medium">{format(startDateLocal, "PPP")}</span>
                ) : (
                  <span className="text-muted-foreground">Start Date</span>
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
                className="w-full sm:w-64 h-11 justify-start text-left font-normal border-muted-foreground/20 hover:bg-accent/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDateLocal ? (
                  <span className="font-medium">{format(endDateLocal, "PPP")}</span>
                ) : (
                  <span className="text-muted-foreground">End Date</span>
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
      </div>
    </div>
  );
}
