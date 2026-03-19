import { Button } from "@/components/ui/button";
import { PlusCircle, ListPlus, FileUp } from "lucide-react";

interface TranactionsHeaderProps {
  onAddClick: () => void;
  onBulkAddClick: () => void;
  onImportCsvClick: () => void;
}

export function ExpensesHeader({ onAddClick, onBulkAddClick, onImportCsvClick }: TranactionsHeaderProps) {
  return (
    <div className="flex justify-between items-start md:items-center gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">Expenses</h1>
        <p className="text-sm text-muted-foreground tracking-wide"></p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onImportCsvClick} size="sm" variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
        <Button onClick={onBulkAddClick} size="sm" variant="outline">
          <ListPlus className="mr-2 h-4 w-4" />
          Bulk Add
        </Button>
        <Button onClick={onAddClick} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
}
