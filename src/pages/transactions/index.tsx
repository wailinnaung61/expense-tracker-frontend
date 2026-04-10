import { UpcomingPayments } from "@/components/transactions/upcoming-payments";
import { ExpensesHeader } from "@/components/transactions/transactions-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import TransactionsTable from "@/components/transactions/transactions";
import ClientTransactionStats from "@/components/transactions/client-transaction-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Transaction, TransactionListParams } from "@/types/transaction";
import type { ExpenseCategory } from "@/types/category";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import spinnerGif from "@/assets/Spinner.gif";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { budgetService } from "@/services/budgetService";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { BulkAddTransactionDialog } from "@/components/transactions/bulk-add-transaction-dialog";
import { ImportCsvDialog } from "@/components/transactions/import-csv-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CHATBOT_REFRESH_EVENT, type ChatbotRefreshEventDetail } from "@/lib/chatbot-refresh";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CreditCard, Banknote } from "lucide-react";

type BudgetInsight = {
  hasBudget: boolean;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  usagePercent: number;
};

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
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetInsight, setBudgetInsight] = useState<BudgetInsight>({
    hasBudget: false,
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    usagePercent: 0,
  });

  const { t } = useTranslation();
  const pageSize = 10;
  const currency = user?.currency || "USD";

  const budgetMonthLabel = useMemo(() => {
    const reference = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
    return Number.isNaN(reference.getTime())
      ? format(new Date(), "MMM yyyy")
      : format(reference, "MMM yyyy");
  }, [startDate]);

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

  const fetchBudgetInsight = useCallback(async () => {
    const reference = startDate ? new Date(`${startDate}T00:00:00`) : new Date();

    if (Number.isNaN(reference.getTime())) {
      setBudgetInsight((current) => ({ ...current, hasBudget: false }));
      return;
    }

    setBudgetLoading(true);
    try {
      const response = await budgetService.getBudgetByMonth(
        reference.getFullYear(),
        reference.getMonth() + 1
      );

      setBudgetInsight({
        hasBudget: Boolean(response.budgetId),
        totalBudget: response.summary.totalBudget,
        totalSpent: response.summary.totalSpent,
        remaining: response.summary.remaining,
        usagePercent: response.summary.usagePercent,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setBudgetInsight({
          hasBudget: false,
          totalBudget: 0,
          totalSpent: 0,
          remaining: 0,
          usagePercent: 0,
        });
      } else {
        console.error("Failed to fetch budget insight:", error);
      }
    } finally {
      setBudgetLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    void fetchBudgetInsight();
  }, [fetchBudgetInsight, budgetRefreshKey]);

  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<ChatbotRefreshEventDetail>;
      const target = customEvent.detail?.target;

      if (target === "transactions") {
        setTransactionsRefreshKey((prev) => prev + 1);
        setSummaryRefreshKey((prev) => prev + 1);
        setBudgetRefreshKey((prev) => prev + 1);
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

      if (target === "budget") {
        setBudgetRefreshKey((prev) => prev + 1);
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
    setBudgetRefreshKey((prev) => prev + 1);
  }, [currentMonthRange, startDate, endDate]);

  const handleDeleteSuccess = useCallback(() => {
    setTransactionsRefreshKey((prev) => prev + 1);
    setSummaryRefreshKey((prev) => prev + 1);
    setBudgetRefreshKey((prev) => prev + 1);
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
    setBudgetRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <ExpensesHeader
        onRefresh={handleRefreshClick}
        onAddClick={handleAddClick}
        onBulkAddClick={handleBulkAddClick}
        onImportCsvClick={handleImportCsvClick}
      />

      <Card className="border-slate-200 dark:border-slate-700 bg-card">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">{t("transactions.budgetPulse.title", { month: budgetMonthLabel })}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {budgetInsight.hasBudget
                  ? t("transactions.budgetPulse.subtitle")
                  : t("transactions.budgetPulse.nobudget")}
              </p>
            </div>
            <a href="/budget" className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">
              {t("transactions.budgetPulse.openBudget")}
            </a>
          </div>

          {budgetLoading ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("transactions.budgetPulse.loading")}</div>
          ) : budgetInsight.hasBudget ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Total Budget Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-500/20 dark:via-cyan-500/10 p-5 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-3">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs uppercase tracking-[0.15em] font-medium text-blue-700 dark:text-blue-300 mb-2">{t("transactions.budgetPulse.totalBudget")}</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(budgetInsight.totalBudget, currency)}</div>
                  </div>
                </div>

                {/* Spent Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-500/20 dark:via-red-500/10 p-5 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-rose-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 flex items-center justify-center mb-3">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs uppercase tracking-[0.15em] font-medium text-rose-700 dark:text-rose-300 mb-2">{t("transactions.budgetPulse.spent")}</div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(budgetInsight.totalSpent, currency)}</div>
                  </div>
                </div>

                {/* Remaining Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500/10 via-green-500/5 to-transparent dark:from-emerald-500/20 dark:via-green-500/10 p-5 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-3">
                      <Banknote className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs uppercase tracking-[0.15em] font-medium text-emerald-700 dark:text-emerald-300 mb-2">{t("transactions.budgetPulse.remaining")}</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(budgetInsight.remaining, currency)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>{t("transactions.budgetPulse.usage")}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{budgetInsight.usagePercent}%</span>
                </div>
                <Progress value={Math.min(budgetInsight.usagePercent, 100)} className="h-2" />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

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
