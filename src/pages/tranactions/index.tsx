import ClientTransactionStats from "@/components/tranactions/client-transaction-stats"
import { ExpensesHeader } from "@/components/tranactions/tranactions-header"
import { TransactionFilters } from "@/components/tranactions/tranaction-filters"
import TransactionsTable from "@/components/tranactions/tranactions"
import type { Transaction, TransactionListParams } from "@/types/transaction"
import type { ExpenseCategory } from "@/types/category"
import { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import spinnerGif from "@/assets/Spinner.gif";
import { transactionService } from "@/services/tranactionService"
import { categoryService } from "@/services/categoryService"
import { AddTransactionDialog } from "@/components/tranactions/add-transaction-dialog"
import { BulkAddTransactionDialog } from "@/components/tranactions/bulk-add-transaction-dialog"
import { ImportCsvDialog } from "@/components/tranactions/import-csv-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function Tranactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  
  // Memoize current month range
  const currentMonthRange = useMemo(() => {
    const now = new Date();
    return {
      start: format(startOfMonth(now), "yyyy-MM-dd"),
      end: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  }, []);
  
  const [startDate, setStartDate] = useState<string>(currentMonthRange.start);
  const [endDate, setEndDate] = useState<string>(currentMonthRange.end);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [tokenHistory, setTokenHistory] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);

  const pageSize = 10;
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pagination: {
            pageSize: 100,
          },
        });
        setCategories(response.items);
      } catch (error) {
        // Silent fail - categories will be empty array
      }
    };
    fetchCategories();
  }, []);

  const fetchTransactions = useCallback(async (token: string | null = null) => {
    setLoading(true);
    try {
      const params: TransactionListParams = {
        pagination: {
          pageNumber: currentPage,
          pageSize,
          nextPageToken: token || undefined,
          hasCursor: !!token,
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
      setTotalCount(response.totalCount);
      setNextPageToken(response.nextPageToken || null);
      setHasNextPage(response.hasNextPage);
      
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
  }, [type, status, categoryId, keyword, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchTransactions(currentToken);
  }, [fetchTransactions, transactionsRefreshKey, currentToken]);

  const handleTypeChange = useCallback((newType: string) => {
    setType(newType);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleCategoryChange = useCallback((newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleStartDateChange = useCallback((newStartDate: string) => {
    setStartDate(newStartDate);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleEndDateChange = useCallback((newEndDate: string) => {
    setEndDate(newEndDate);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage && nextPageToken) {
      setTokenHistory(prev => [...prev, currentToken || '']);
      setCurrentPage(prev => prev + 1);
      setCurrentToken(nextPageToken);
    }
  }, [hasNextPage, nextPageToken, currentToken]);

  const handlePreviousPage = useCallback(() => {
    if (tokenHistory.length > 0) {
      const newHistory = [...tokenHistory];
      const prevToken = newHistory.pop();
      setTokenHistory(newHistory);
      setCurrentPage(prev => prev - 1);
      setCurrentToken(prevToken || null);
    }
  }, [tokenHistory]);

  const handleAddClick = useCallback(() => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  }, []);

  const handleBulkAddClick = useCallback(() => {
    setBulkDialogOpen(true);
  }, []);

  const handleImportCsvClick = useCallback(() => {
    setCsvImportDialogOpen(true);
  }, []);
  
  const handleEditClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  }, []);

  const handleDuplicateClick = useCallback((transaction: Transaction) => {
    // Create a copy without the ID to treat as a new transaction
    const duplicatedTransaction: Transaction = {
      ...transaction,
      tranactionId: '', // Clear ID so it creates a new one
      tranactionDate: new Date().toISOString(), // Set to today
    };
    setSelectedTransaction(duplicatedTransaction);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setCurrentPage(1); // Reset to first page
    // Clear date filters to ensure new transaction is visible
    setStartDate("");
    setEndDate("");
    // Reset pagination state
    setCurrentToken(null);
    setTokenHistory([]);
    // Trigger refresh after state updates
    setStatsRefreshKey(prev => prev + 1);
    setTransactionsRefreshKey(prev => prev + 1);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setStatsRefreshKey(prev => prev + 1);
    setTransactionsRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <ExpensesHeader 
        onAddClick={handleAddClick} 
        onBulkAddClick={handleBulkAddClick}
        onImportCsvClick={handleImportCsvClick}
      />

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
              currentPage={currentPage}
              totalCount={totalCount}
              hasNextPage={hasNextPage}
              hasPreviousPage={tokenHistory.length > 0}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onEdit={handleEditClick}
              onDuplicate={handleDuplicateClick}
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

      <BulkAddTransactionDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <ImportCsvDialog
        open={csvImportDialogOpen}
        onOpenChange={setCsvImportDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
