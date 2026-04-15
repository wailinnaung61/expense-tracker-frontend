import { Button } from "@/components/ui/button";
import { PlusCircle, ListPlus, FileUp, RefreshCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionsHeaderProps {
  onRefresh: () => void;
  onAddClick: () => void;
  onBulkAddClick: () => void;
  onImportCsvClick: () => void;
}

export function ExpensesHeader({ onRefresh, onAddClick, onBulkAddClick, onImportCsvClick }: TransactionsHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <h1 className="text-lg font-semibold tracking-wide sm:text-xl">{t("transactions.header.title")}</h1>
        <p className="text-sm text-muted-foreground tracking-wide"></p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
        <Button onClick={onRefresh} size="sm" variant="outline" className="h-10">
          <RefreshCcw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("transactions.header.refresh")}</span>
        </Button>
        <Button onClick={onImportCsvClick} size="sm" variant="outline" className="h-10">
          <FileUp className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("transactions.header.importCsv")}</span>
        </Button>
        <Button onClick={onBulkAddClick} size="sm" variant="outline" className="h-10">
          <ListPlus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("transactions.header.bulkAdd")}</span>
        </Button>
        <Button onClick={onAddClick} size="sm" className="h-10">
          <PlusCircle className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("transactions.header.addTransaction")}</span>
        </Button>
      </div>
    </div>
  );
}
