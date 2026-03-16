import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CategoriesHeaderProps {
  onAddClick: () => void;
}

export function CategoriesHeader({ onAddClick }: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">Categories</h1>
        <p className="text-sm text-muted-foreground tracking-wide">
          Manage your expense categories
        </p>
      </div>
      <Button onClick={onAddClick} size="sm" className="w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" />
        <span>Add Category</span>
      </Button>
    </div>
  );
}
