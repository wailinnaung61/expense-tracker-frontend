import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={String(TransactionType.Income)}>Income</SelectItem>
            <SelectItem value={String(TransactionType.Expense)}>Expense</SelectItem>
            <SelectItem value={String(TransactionType.Investment)}>Investment</SelectItem>
            <SelectItem value={String(TransactionType.Savings)}>Savings</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
