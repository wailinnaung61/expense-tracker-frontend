import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { PlusCircle, RefreshCcw, FolderPlus } from "lucide-react";

interface InvestmentHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
  onPortfolioClick: () => void;
}

export function InvestmentHeader({
  onAddClick,
  onRefresh,
  onPortfolioClick,
}: InvestmentHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">{t("investments.header.title")}</h1>
        <p className="text-sm text-muted-foreground tracking-wide">
          {t("investments.header.subtitle")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onRefresh} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t("investments.header.refresh")}
        </Button>
        <Button onClick={onPortfolioClick} size="sm" variant="outline">
          <FolderPlus className="mr-2 h-4 w-4" />
          {t("investments.header.portfolios")}
        </Button>
        <Button onClick={onAddClick} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("investments.header.addInvestment")}
        </Button>
      </div>
    </div>
  );
}
