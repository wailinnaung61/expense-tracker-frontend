import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { AssetType, InvestmentStatus } from "@/types/investment";
import type { InvestmentPortfolio } from "@/types/investment";
import { Search } from "lucide-react";

interface InvestmentFiltersProps {
  assetType: string;
  status: string;
  portfolioId: string;
  keyword: string;
  portfolios: InvestmentPortfolio[];
  onAssetTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onPortfolioChange: (portfolioId: string) => void;
  onKeywordChange: (keyword: string) => void;
}

export function InvestmentFilters({
  assetType,
  status,
  portfolioId,
  keyword,
  portfolios,
  onAssetTypeChange,
  onStatusChange,
  onPortfolioChange,
  onKeywordChange,
}: InvestmentFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-md">
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("investments.filters.searchPlaceholder")}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="ps-10 h-11 border-muted-foreground/20 focus-visible:ring-2"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <Select value={assetType} onValueChange={onAssetTypeChange}>
              <SelectTrigger className="w-full sm:w-44 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("investments.filters.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("investments.filters.allTypes")}</SelectItem>
                <SelectItem value={String(AssetType.Stock)}>{t("investments.filters.stock")}</SelectItem>
                <SelectItem value={String(AssetType.Crypto)}>{t("investments.filters.crypto")}</SelectItem>
                <SelectItem value={String(AssetType.Bond)}>{t("investments.filters.bond")}</SelectItem>
                <SelectItem value={String(AssetType.MutualFund)}>{t("investments.filters.mutualFund")}</SelectItem>
                <SelectItem value={String(AssetType.RealEstate)}>{t("investments.filters.realEstate")}</SelectItem>
                <SelectItem value={String(AssetType.Gold)}>{t("investments.filters.gold")}</SelectItem>
                <SelectItem value={String(AssetType.Other)}>{t("investments.filters.other")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-40 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("investments.filters.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("investments.filters.allStatus")}</SelectItem>
                <SelectItem value={String(InvestmentStatus.Holding)}>{t("investments.filters.holding")}</SelectItem>
                <SelectItem value={String(InvestmentStatus.Sold)}>{t("investments.filters.sold")}</SelectItem>
                <SelectItem value={String(InvestmentStatus.PartialSold)}>{t("investments.filters.partialSold")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={portfolioId} onValueChange={onPortfolioChange}>
              <SelectTrigger className="w-full sm:w-44 h-11 border-muted-foreground/20">
                <SelectValue placeholder={t("investments.filters.allPortfolios")} />
              </SelectTrigger>
              <SelectContent className="max-h-100">
                <SelectItem value="all">{t("investments.filters.allPortfolios")}</SelectItem>
                {portfolios.map((p) => (
                  <SelectItem key={p.portfolioId} value={p.portfolioId}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
