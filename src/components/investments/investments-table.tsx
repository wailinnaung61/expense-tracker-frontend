import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/useTranslation";
import { investmentService } from "@/services/investmentService";
import { formatCurrency } from "@/lib/utils";
import type { Investment, InvestmentPortfolio } from "@/types/investment";
import { ChevronLeft, ChevronRight, Edit, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface InvestmentsTableProps {
  investments: Investment[];
  portfolios: InvestmentPortfolio[];
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onEdit: (investment: Investment) => void;
  onDelete: () => void;
  currency?: string;
}

const getStatusBadgeClass = (status: string): string => {
  const s = status.toUpperCase();
  if (s === "HOLDING")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (s === "SOLD")
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  if (s === "PARTIALSOLD")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
};

const getAssetTypeBadgeClass = (type: string): string => {
  const t = type.toUpperCase();
  if (t === "STOCK")
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (t === "CRYPTO")
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  if (t === "BOND")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (t === "MUTUALFUND")
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (t === "REALESTATE")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (t === "GOLD")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
};

export function InvestmentsTable({
  investments,
  portfolios,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onEdit,
  onDelete,
  currency = "USD",
}: InvestmentsTableProps) {
  const { t } = useTranslation();

  const handleDelete = async (investmentId: string) => {
    const result = await Swal.fire({
      title: t("investments.feedback.confirmDeleteTitle"),
      text: t("investments.feedback.confirmDeleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("investments.feedback.confirmButton"),
      cancelButtonText: t("investments.feedback.cancelButton"),
    });

    if (result.isConfirmed) {
      try {
        await investmentService.deleteInvestment(investmentId);
        await Swal.fire({
          icon: "success",
          title: t("investments.feedback.deleted"),
          timer: 2000,
          showConfirmButton: false,
        });
        onDelete();
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : t("investments.feedback.deleteFailed"));
      }
    }
  };

  if (investments.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">{t("investments.table.noData")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="space-y-4">
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader className="bg-accent text-accent-foreground">
              <TableRow>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.asset")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.type")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.qty")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.buyPrice")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.current")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.invested")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.value")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.pnl")}</TableHead>
                <TableHead className="hidden xl:table-cell px-4 py-2 font-medium">{t("investments.table.portfolio")}</TableHead>
                <TableHead className="hidden 2xl:table-cell px-4 py-2 font-medium">{t("investments.table.notes")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("investments.table.status")}</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">{t("investments.table.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => {
                const isProfit = inv.profitLoss >= 0;
                return (
                  <TableRow key={inv.investmentId}>
                    <TableCell className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{inv.assetName}</p>
                        {inv.symbol && (
                          <p className="text-xs text-muted-foreground">{inv.symbol}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getAssetTypeBadgeClass(inv.assetType)}`}
                      >
                        {inv.assetType}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">{inv.quantity}</TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {formatCurrency(inv.purchasePrice, currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {formatCurrency(inv.currentPrice, currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {formatCurrency(inv.totalInvested, currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {formatCurrency(inv.currentValue, currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isProfit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(inv.profitLoss, currency)}
                        </p>
                        <p
                          className={`text-xs ${
                            isProfit
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {inv.returnPercentage.toFixed(2)}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {portfolios.find((p) => p.portfolioId === inv.portfolioId)?.name || "—"}
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell px-4 py-3 text-sm text-muted-foreground max-w-50 truncate">
                      {inv.notes || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(inv.status)}`}
                      >
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(inv)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("investments.table.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(inv.investmentId)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("investments.table.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(hasNextPage || hasPreviousPage) && (
          <div className="flex flex-wrap justify-between items-center">
            <span className="text-sm text-muted-foreground mb-1 md:mb-0">
              {t("investments.table.pagination", { current: currentPage, count: totalCount })}
            </span>
            <div className="flex gap-2">
              {hasPreviousPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviousPage}
                  className="px-3 py-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("common.previous")}
                </Button>
              )}
              {hasNextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextPage}
                  className="px-3 py-2"
                >
                  {t("common.next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
