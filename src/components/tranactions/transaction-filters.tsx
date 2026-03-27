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
import type { CategoryListParams, ExpenseCategory } from "@/types/category";
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
    onStartDateChange(date ? date.toISOString().split("T")[0] : "");
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDateLocal(date);
    onEndDateChange(date ? date.toISOString().split("T")[0] : "");
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
          pageSize: 999999999, // Fetch all categories for the dropdown
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
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [type]);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute inset-s-2.5 top-2.5 h-4 w-4 border-muted text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="ps-8 bg-transparent"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className="w-35 bg-transparent">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="0">Income</SelectItem>
                <SelectItem value="1">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-35 bg-transparent">
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
              <SelectTrigger className="w-35 bg-transparent">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="max-h-75">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    <div className="flex items-center gap-2" style={{ color: cat.color }}>
                      <span className="text-lg">
                        {cat.icon}
                      </span>
                      <span>{cat.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDateLocal ? format(startDateLocal, "PPP") : <span>Start Date</span>}
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
          </div>
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDateLocal ? format(endDateLocal, "PPP") : <span>End Date</span>}
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
    </div>
  );
}
