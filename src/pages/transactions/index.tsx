import { UpcomingPayments } from "@/components/transactions/upcoming-payments";
import { ExpensesHeader } from "@/components/transactions/transactions-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import TransactionsTable from "@/components/transactions/transactions";
import ClientTransactionStats from "@/components/transactions/client-transaction-stats";
import type { Transaction, TransactionListParams } from "@/types/transaction";
import type { ExpenseCategory } from "@/types/category";
import { useEffect, useState, useCallback, useMemo } from "react";
import spinnerGif from "@/assets/Spinner.gif";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { BulkAddTransactionDialog } from "@/components/transactions/bulk-add-transaction-dialog";
import { ImportCsvDialog } from "@/components/transactions/import-csv-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CHATBOT_REFRESH_EVENT, type ChatbotRefreshEventDetail } from "@/lib/chatbot-refresh";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");

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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextCursorId, setNextCursorId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentCursorId, setCurrentCursorId] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<{ cursor: string | null; cursorId: string | null }>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);
  const [recurringPaymentsRefreshKey, setRecurringPaymentsRefreshKey] = useState(0);

  const pageSize = 10;
  const currency = user?.currency || "USD";

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategories({
        pageSize: 100,
      });

      const seen = new Map<string, ExpenseCategory>();
      (response.items || []).forEach((cat) => {
        const existing = seen.get(cat.categoryId);
        if (
          !existing ||
          (cat.updatedAt && existing.updatedAt && cat.updatedAt > existing.updatedAt) ||
          (cat.updatedAt && !existing.updatedAt)
        ) {
          seen.set(cat.categoryId, cat);
        }
      });

      setCategories(Array.from(seen.values()));
    } catch {
      // Silent fail - categories remain empty.
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories, categoriesRefreshKey]);

  const fetchTransactions = useCallback(
    async (cursor: string | null = null, cursorId: string | null = null) => {
      setLoading(true);
      try {
        const params: TransactionListParams = {
          pageSize,
        };

        if (cursor && cursorId) {
          params.cursor = cursor;
          params.cursorId = cursorId;
        }

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

        const seen = new Map<string, Transaction>();
        (response.items || []).forEach((trans) => {
          const existing = seen.get(trans.tranactionId);
          if (
            !existing ||
            (trans.updatedAt && existing.updatedAt && trans.updatedAt > existing.updatedAt) ||
            (trans.updatedAt && !existing.updatedAt)
          ) {
            seen.set(trans.tranactionId, trans);
          }
        });

        setTransactions(Array.from(seen.values()));
        setTotalCount(response.totalCount);
        setNextCursor(response.nextCursor || null);
        setNextCursorId(response.nextCursorId || null);
        setHasNextPage(response.hasNextPage);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    },
    [type, status, categoryId, keyword, startDate, endDate, pageSize]
  );

  useEffect(() => {
    void fetchTransactions(currentCursor, currentCursorId);
  }, [fetchTransactions, transactionsRefreshKey, currentCursor, currentCursorId]);

  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<ChatbotRefreshEventDetail>;
      const target = customEvent.detail?.target;

      if (target === "transactions") {
        setTransactionsRefreshKey((prev) => prev + 1);
        setSummaryRefreshKey((prev) => prev + 1);
      }

      if (target === "summary") {
        setSummaryRefreshKey((prev) => prev + 1);
      }

      if (target === "categories") {
        setCategoriesRefreshKey((prev) => prev + 1);
      }

      if (target === "recurring_payments") {
        setRecurringPaymentsRefreshKey((prev) => prev + 1);
      }

    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, []);

  const handleTypeChange = useCallback((newType: string) => {
    setType(newType);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleCategoryChange = useCallback((newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleStartDateChange = useCallback((newStartDate: string) => {
    setStartDate(newStartDate);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleEndDateChange = useCallback((newEndDate: string) => {
    setEndDate(newEndDate);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage && nextCursor && nextCursorId) {
      setCursorHistory((prev) => [...prev, { cursor: currentCursor, cursorId: currentCursorId }]);
      setCurrentPage((prev) => prev + 1);
      setCurrentCursor(nextCursor);
      setCurrentCursorId(nextCursorId);
    }
  }, [hasNextPage, nextCursor, nextCursorId, currentCursor, currentCursorId]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursors = newHistory.pop();
      setCursorHistory(newHistory);
      setCurrentPage((prev) => prev - 1);
      setCurrentCursor(prevCursors?.cursor || null);
      setCurrentCursorId(prevCursors?.cursorId || null);
    }
  }, [cursorHistory]);

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
    const duplicatedTransaction: Transaction = {
      ...transaction,
      tranactionId: "",
      tranactionDate: format(new Date(), "yyyy-MM-dd"),
    };
    setSelectedTransaction(duplicatedTransaction);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setCurrentPage(1);
    if (startDate === currentMonthRange.start && endDate === currentMonthRange.end) {
      setStartDate(currentMonthRange.start);
      setEndDate(currentMonthRange.end);
    }
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
    setTransactionsRefreshKey((prev) => prev + 1);
    setSummaryRefreshKey((prev) => prev + 1);
  }, [currentMonthRange, startDate, endDate]);

  const handleDeleteSuccess = useCallback(() => {
    setTransactionsRefreshKey((prev) => prev + 1);
    setSummaryRefreshKey((prev) => prev + 1);
  }, []);

  const handleRefreshClick = useCallback(() => {
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
    setTransactionsRefreshKey((prev) => prev + 1);
    setSummaryRefreshKey((prev) => prev + 1);
    setCategoriesRefreshKey((prev) => prev + 1);
    setRecurringPaymentsRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <ExpensesHeader
        onRefresh={handleRefreshClick}
        onAddClick={handleAddClick}
        onBulkAddClick={handleBulkAddClick}
        onImportCsvClick={handleImportCsvClick}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
              <img src={spinnerGif} alt="Loading" className="h-12 w-12" />
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              categories={categories}
              currentPage={currentPage}
              totalCount={totalCount}
              hasNextPage={hasNextPage}
              hasPreviousPage={cursorHistory.length > 0}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onEdit={handleEditClick}
              onDuplicate={handleDuplicateClick}
              onDelete={handleDeleteSuccess}
              currency={currency}
            />
          )}

          <UpcomingPayments
            startDate={startDate}
            endDate={endDate}
            onTransactionCreated={handleDialogSuccess}
            refreshKey={recurringPaymentsRefreshKey}
          />
        </div>

        <div className="lg:col-span-1">
          <ClientTransactionStats refreshKey={summaryRefreshKey} />
        </div>
      </div>

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        transaction={selectedTransaction}
        currency={currency}
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
  );
}
