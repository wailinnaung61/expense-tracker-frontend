import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface TranactionsHeaderProps {
  onAddClick: () => void;
}

export function ExpensesHeader({ onAddClick }: TranactionsHeaderProps) {
  return (
    <div className="flex justify-between items-start md:items-center gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">Expenses</h1>
        <p className="text-sm text-muted-foreground tracking-wide"></p>
      </div>
      <Button onClick={onAddClick} size="sm" className="width-fit">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
    </div>
  );
}
