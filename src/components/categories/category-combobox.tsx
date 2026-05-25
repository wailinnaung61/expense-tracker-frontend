import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType } from "@/types/category";

const ALL_OPTION_VALUE = "__all__";

interface CategoryComboboxProps {
  value: string | undefined;
  onChange: (categoryId: string) => void;
  categories: ExpenseCategory[];
  filterType?: TransactionType | number | string;
  placeholder?: string;
  emptyHint?: string;
  includeAllOption?: boolean;
  allLabel?: string;
  disabled?: boolean;
  id?: string;
  triggerClassName?: string;
  contentClassName?: string;
  invalid?: boolean;
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  filterType,
  placeholder,
  emptyHint,
  includeAllOption = false,
  allLabel,
  disabled = false,
  id,
  triggerClassName,
  contentClassName,
  invalid = false,
}: CategoryComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    if (filterType === undefined || filterType === "") {
      return categories;
    }
    const typeNum = Number(filterType);
    if (Number.isNaN(typeNum)) return categories;
    return categories.filter((cat) => Number(cat.type) === typeNum);
  }, [categories, filterType]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.categoryId === value),
    [categories, value]
  );

  const showingAll = includeAllOption && (value === ALL_OPTION_VALUE || !value);
  const resolvedAllLabel = allLabel ?? t("common.search.allCategories");
  const resolvedPlaceholder = placeholder ?? t("common.search.selectCategory");
  const resolvedEmptyHint = emptyHint ?? t("common.search.noResults");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between font-normal",
            !selectedCategory && !showingAll && "text-muted-foreground",
            triggerClassName
          )}
        >
          {selectedCategory ? (
            <span
              className="flex items-center gap-2 truncate"
              style={{ color: selectedCategory.color }}
            >
              <span className="text-base leading-none">
                {selectedCategory.icon}
              </span>
              <span className="truncate">{selectedCategory.displayName}</span>
            </span>
          ) : showingAll ? (
            <span className="truncate">{resolvedAllLabel}</span>
          ) : (
            <span className="truncate">{resolvedPlaceholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-(--radix-popover-trigger-width) min-w-56 p-0",
          contentClassName
        )}
        align="start"
      >
        <Command>
          <CommandInput placeholder={t("common.search.placeholder")} />
          <CommandList>
            <CommandEmpty>{resolvedEmptyHint}</CommandEmpty>
            <CommandGroup>
              {includeAllOption && (
                <CommandItem
                  value={resolvedAllLabel}
                  onSelect={() => {
                    onChange(ALL_OPTION_VALUE);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1 truncate">{resolvedAllLabel}</span>
                  <Check
                    className={cn(
                      "size-4",
                      showingAll ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              )}
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.categoryId}
                  value={`${category.displayName} ${category.categoryId}`}
                  onSelect={() => {
                    onChange(category.categoryId);
                    setOpen(false);
                  }}
                >
                  <span
                    className="flex flex-1 items-center gap-2 truncate"
                    style={{ color: category.color }}
                  >
                    <span className="text-base leading-none">
                      {category.icon}
                    </span>
                    <span className="truncate">{category.displayName}</span>
                  </span>
                  <Check
                    className={cn(
                      "size-4",
                      value === category.categoryId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { ALL_OPTION_VALUE as CATEGORY_COMBOBOX_ALL_VALUE };
