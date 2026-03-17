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
import { transactionService } from "@/services/tranactionService";
import { formatCurrency } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: ExpenseCategory[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: () => void;
  currency?: string;
}

export default function TransactionsTable({
  transactions,
  categories,
  totalPages,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  currency = "USD",
}: TransactionsTableProps) {

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
        return "Completed";
      case PaymentStatus.Pending:
        return "Pending";
      case PaymentStatus.Failed:
        return "Failed";
      default:
        return "Unknown";
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
      title: "Are you sure?",
      text: "Do you want to delete this transaction? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await transactionService.deleteTransaction(transactionId);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Transaction has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
        onDelete();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete transaction",
        });
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
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Transaction status updated",
        timer: 2000,
        showConfirmButton: false,
      });
      onDelete(); // Refresh the list
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update status",
      });
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No transactions found.</p>
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
                <TableHead className="px-4 py-2 font-medium">Category</TableHead>
                <TableHead className="px-4 py-2 font-medium">Type</TableHead>
                <TableHead className="px-4 py-2 font-medium">Date</TableHead>
                <TableHead className="px-4 py-2 font-medium">Amount</TableHead>
                <TableHead className="px-4 py-2 font-medium">Status</TableHead>
                <TableHead className="px-4 py-2 font-medium">
                  Description
                </TableHead>
                <TableHead className="px-4 py-2 font-medium">Note</TableHead>
                <TableHead className="px-4 py-2 font-medium text-right">
                  Action
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
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm">{category.displayName}</span>
                          </>
                        )}
                        {!category && (
                          <span className="text-sm text-muted-foreground">Unknown</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === TransactionType.Income
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {transaction.type === TransactionType.Income ? "Income" : "Expense"}
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
                      {transaction.description || "No description"}
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Completed)}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Pending)}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleStatusChange(transaction, PaymentStatus.Failed)}
                          >
                            Mark as Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(transaction.tranactionId)}
                          >
                            Delete
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
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-between items-center">
            <span className="text-sm text-muted-foreground mb-1 md:mb-0">
              Page {currentPage} of {totalPages}
            </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-1 py-2 rtl:rotate-180"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Smart pagination logic */}
            {(() => {
              const pages: (number | string)[] = [];
              const showEllipsisStart = currentPage > 3;
              const showEllipsisEnd = currentPage < totalPages - 2;

              // Always show first page
              pages.push(1);

              // Show ellipsis after first page
              if (showEllipsisStart) {
                pages.push('...');
              }

              // Show pages around current page
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);
              
              for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                  pages.push(i);
                }
              }

              // Show ellipsis before last page
              if (showEllipsisEnd) {
                pages.push('...');
              }

              // Always show last page (if more than 1 page)
              if (totalPages > 1) {
                pages.push(totalPages);
              }

              return pages.map((page, idx) =>
                typeof page === 'number' ? (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="px-2 py-2 min-w-8"
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground">
                    {page}
                  </span>
                )
              );
            })()}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-1 py-2 rtl:rotate-180"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
