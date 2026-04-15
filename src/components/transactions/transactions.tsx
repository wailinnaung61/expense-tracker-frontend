import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType, PaymentStatus } from "@/types/transaction";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { transactionService } from "@/services/transactionService";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: ExpenseCategory[];
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: () => void;
  currency?: string;
}

export default function TransactionsTable({
  transactions,
  categories,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onEdit,
  onDuplicate,
  onDelete,
  currency = "USD",
}: TransactionsTableProps) {

  const { t } = useTranslation();

  const getCategoryById = (categoryId: string) => {
    return categories.find((cat) => cat.categoryId === categoryId);
  };

  const formatAmount = (amount: number, type: number) => {
    const formattedAmount = formatCurrency(amount, currency);

    return type === TransactionType.Income
      ? `+${formattedAmount}`
      : `-${formattedAmount}`;
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case PaymentStatus.Completed:
        return t("transactions.status.completed");
      case PaymentStatus.Pending:
        return t("transactions.status.pending");
      case PaymentStatus.Failed:
        return t("transactions.status.failed");
      default:
        return t("transactions.status.unknown");
    }
  };

  const getTypeLabel = (type: number) => {
    switch (type) {
      case TransactionType.Income:
        return t("transactions.type.income");
      case TransactionType.Expense:
        return t("transactions.type.expense");
      case TransactionType.Investment:
        return t("transactions.type.investment");
      case TransactionType.Savings:
        return t("transactions.type.savings");
      default:
        return t("transactions.type.expense");
    }
  };

  const getStatusStyle = (status: number) => {
    switch (status) {
      case PaymentStatus.Completed:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case PaymentStatus.Pending:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case PaymentStatus.Failed:
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleDelete = async (transactionId: string) => {
    const result = await Swal.fire({
      title: t("transactions.table.deleteConfirmTitle"),
      text: t("transactions.table.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("transactions.table.deleteConfirmButton"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await transactionService.deleteTransaction(transactionId);
        toast.success(t("transactions.table.deleteSuccessText"));
        onDelete();
      } catch (error: any) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const handleStatusChange = async (transaction: Transaction, newStatus: number) => {
    try {
      await transactionService.updateTransaction(transaction.tranactionId, {
        type: transaction.type,
        categoryId: transaction.categoryId,
        amount: transaction.amount,
        tranactionDate: transaction.tranactionDate,
        status: newStatus as PaymentStatus,
        description: transaction.description,
        note: transaction.note,
        imageUrl: transaction.imageUrl,
      });
      toast.success(t("transactions.table.statusUpdateSuccess"));
      onDelete(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to update status:", error);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">{t("transactions.table.noTransactions")}</p>
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
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colCategory")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colType")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colDate")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colAmount")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colStatus")}</TableHead>
                <TableHead className="px-4 py-2 font-medium">
                  {t("transactions.table.colDescription")}
                </TableHead>
                <TableHead className="px-4 py-2 font-medium">{t("transactions.table.colNote")}</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">
                  {t("transactions.table.colAction")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                return (
                  <TableRow key={transaction.tranactionId}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {category && (
                          <>
                            <span className="text-lg" style={{ color: category.color }}>
                              {category.icon}
                            </span>
                            <span className="text-sm font-medium" style={{ color: category.color }}>
                              {category.displayName}
                            </span>
                          </>
                        )}
                        {!category && (
                          <span className="text-sm text-muted-foreground">{t("transactions.table.unknownCategory")}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === TransactionType.Income
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : transaction.type === TransactionType.Investment
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : transaction.type === TransactionType.Savings
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {getTypeLabel(transaction.type)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 min-w-32">
                      {format(new Date(transaction.tranactionDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-3 font-semibold ${
                        transaction.type === TransactionType.Income
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 max-w-xs truncate">
                      {transaction.description || t("transactions.table.noDescription")}
                    </TableCell>
                    <TableCell className="px-4 py-3 max-w-xs truncate">
                      {transaction.note || "-"}
                    </TableCell>

                    {/* Action Column */}
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            {t("transactions.table.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(transaction)}>
                            {t("transactions.table.duplicate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Completed)}
                          >
                            {t("transactions.table.markCompleted")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Pending)}
                          >
                            {t("transactions.table.markPending")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Failed)}
                          >
                            {t("transactions.table.markFailed")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(transaction.tranactionId)}
                          >
                            {t("transactions.table.delete")}
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
              {t("transactions.table.pagination", { current: currentPage, count: totalCount })}
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
