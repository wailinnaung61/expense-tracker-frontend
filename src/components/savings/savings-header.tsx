import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { PlusCircle, RefreshCcw } from "lucide-react";

interface SavingsHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
}

export function SavingsHeader({ onAddClick, onRefresh }: SavingsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
          {t("savings.header.title")}
        </h1>
        <p className="text-sm text-muted-foreground tracking-wide">
          {t("savings.header.subtitle")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onRefresh} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t("savings.header.refresh")}
        </Button>
        <Button onClick={onAddClick} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("savings.header.addGoal")}
        </Button>
      </div>
    </div>
  );
}
