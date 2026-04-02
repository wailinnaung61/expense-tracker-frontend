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
    <div className="flex justify-between items-start md:items-center gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">{t("transactions.header.title")}</h1>
        <p className="text-sm text-muted-foreground tracking-wide"></p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefresh} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t("transactions.header.refresh")}
        </Button>
        <Button onClick={onImportCsvClick} size="sm" variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          {t("transactions.header.importCsv")}
        </Button>
        <Button onClick={onBulkAddClick} size="sm" variant="outline">
          <ListPlus className="mr-2 h-4 w-4" />
          {t("transactions.header.bulkAdd")}
        </Button>
        <Button onClick={onAddClick} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("transactions.header.addTransaction")}
        </Button>
      </div>
    </div>
  );
}
