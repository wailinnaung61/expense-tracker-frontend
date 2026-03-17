import ClientTransactionStats from "@/components/tranactions/client-transaction-stats"
import { ExpensesHeader } from "@/components/tranactions/tranactions-header"
import { TransactionFilters } from "@/components/tranactions/tranaction-filters"
import TransactionsTable from "@/components/tranactions/tranactions"
import type { Transaction, TransactionListParams } from "@/types/transaction"
import type { ExpenseCategory } from "@/types/category"
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import spinnerGif from "@/assets/Spinner.gif";
import { transactionService } from "@/services/tranactionService"
import { categoryService } from "@/services/categoryService"
import { AddTransactionDialog } from "@/components/tranactions/add-transaction-dialog"
import { useAuth } from "@/contexts/AuthContext"

export default function Tranactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const pageSize = 10;
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pagination: {
            pageSize: 100, // Get all categories
          },
        });
        setCategories(response.items);
      } catch (error) {
        // Silent fail - categories will be empty array
      }
    };
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: TransactionListParams = {
        pagination: {
          pageNumber: currentPage,
          pageSize,
        },
      };
      if (type !== "all") {
        params.type = type;
      }
      if (status !== "all") {
        params.status = status;
      }
      if (categoryId && categoryId !== "all") {
        params.categoryId = categoryId;
      }
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      const response = await transactionService.getTransactions(params);
      setTransactions(response.items);
      setTotalPages(response.totalPages);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch transactions";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, type, status, categoryId, keyword, startDate, endDate]);

    const handleTypeChange = (newType: string) => {
    setType(newType);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setCurrentPage(1);
  };

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
  };

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    setCurrentPage(1);
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddClick = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };
  
  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchTransactions();
    // Small delay to ensure backend has processed the aggregation
    setTimeout(() => {
      setStatsRefreshKey(prev => prev + 1);
    }, 500);
  };

  const handleDeleteSuccess = () => {
    fetchTransactions();
    // Small delay to ensure backend has processed the aggregation
    setTimeout(() => {
      setStatsRefreshKey(prev => prev + 1);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <ExpensesHeader onAddClick={handleAddClick} />

      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <TransactionFilters  
            type={type}
            status={status}
            categoryId={categoryId}
            keyword={keyword}
            startDate={startDate}
            endDate={endDate}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
            onCategoryChange={handleCategoryChange}
            onKeywordChange={handleKeywordChange}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              categories={categories}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onEdit={handleEditClick}
              onDelete={handleDeleteSuccess}
              currency={user?.currency || "USD"}
            />
          )}
        </div>
        <div className="col-span-12 xl:col-span-4 xl:order-1 sticky top-12">
          <ClientTransactionStats refreshKey={statsRefreshKey} />
        </div>
      </div>

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        transaction={selectedTransaction}
      />
    </div>
  )
}
