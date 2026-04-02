import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import { TransactionType } from "@/types/transaction";
import type { ExpenseCategory } from "@/types/category";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Receipt } from "lucide-react";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  categories: ExpenseCategory[];
  currency: string;
}

function getTypeLabel(type: number): string {
  switch (type) {
    case TransactionType.Income:
      return "Income";
    case TransactionType.Expense:
      return "Expense";
    case TransactionType.Savings:
      return "Saving";
    case TransactionType.Investment:
      return "Invest";
    default:
      return "";
  }
}

function getTypeStyle(type: number): string {
  switch (type) {
    case TransactionType.Income:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case TransactionType.Expense:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case TransactionType.Savings:
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
    case TransactionType.Investment:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getAmountColor(type: number): string {
  switch (type) {
    case TransactionType.Income:
      return "text-green-600 dark:text-green-400";
    case TransactionType.Expense:
      return "text-red-600 dark:text-red-400";
    case TransactionType.Savings:
      return "text-blue-600 dark:text-blue-400";
    case TransactionType.Investment:
      return "text-purple-600 dark:text-purple-400";
    default:
      return "text-foreground";
  }
}

export function RecentTransactionsCard({ transactions, categories, currency }: RecentTransactionsCardProps) {
  const { t } = useTranslation();

  const getCategoryById = (id: string) => categories.find((c) => c.categoryId === id);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("dashboard.recentTransactions")}</CardTitle>
          <Link
            to="/tranaction"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Receipt className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t("dashboard.noTransactions")}</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-accent text-accent-foreground">
                <TableRow>
                  <TableHead className="px-4 py-2 font-medium text-xs">{t("dashboard.category" as any)}</TableHead>
                  <TableHead className="px-4 py-2 font-medium text-xs">{t("dashboard.type" as any)}</TableHead>
                  <TableHead className="px-4 py-2 font-medium text-xs">{t("dashboard.date" as any)}</TableHead>
                  <TableHead className="px-4 py-2 font-medium text-xs text-right">{t("dashboard.amount" as any)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isIncome = tx.type === TransactionType.Income;
                  const category = getCategoryById(tx.categoryId);
                  return (
                    <TableRow key={tx.tranactionId}>
                      <TableCell className="px-4 py-2.5 text-sm max-w-36 truncate">
                        <div className="flex items-center gap-2">
                          {category ? (
                            <>
                              <span className="text-base">{category.icon}</span>
                              <span className="truncate">{category.displayName}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">{tx.categoryName || "—"}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeStyle(tx.type)}`}>
                          {getTypeLabel(tx.type)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-sm whitespace-nowrap">
                        {format(new Date(tx.tranactionDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className={`px-4 py-2.5 text-sm font-semibold text-right whitespace-nowrap ${getAmountColor(tx.type)}`}>
                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
