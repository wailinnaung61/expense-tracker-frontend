import { InvestmentHeader } from "@/components/investments/investment-header";
import { InvestmentFilters } from "@/components/investments/investment-filters";
import { InvestmentDashboardView } from "@/components/investments/investment-dashboard";
import { InvestmentsTable } from "@/components/investments/investments-table";
import { AddInvestmentDialog } from "@/components/investments/add-investment-dialog";
import { InvestmentPortfolioDialog } from "@/components/investments/investment-portfolio-dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { investmentService } from "@/services/investmentService";
import { profileService } from "@/services/profileService";
import type { Investment, InvestmentDashboard, InvestmentFilterParams, InvestmentPortfolio } from "@/types/investment";
import type { ProfileResponse } from "@/types/profile";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import spinnerGif from "@/assets/Spinner.gif";
import { CHATBOT_REFRESH_EVENT, type ChatbotRefreshEventDetail } from "@/lib/chatbot-refresh";

export default function Investments() {
  const { t } = useTranslation();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolios, setPortfolios] = useState<InvestmentPortfolio[]>([]);
  const [dashboard, setDashboard] = useState<InvestmentDashboard | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Filters
  const [assetType, setAssetType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [portfolioId, setPortfolioId] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextCursorId, setNextCursorId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentCursorId, setCurrentCursorId] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<{ cursor: string | null; cursorId: string | null }>>([]);

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pageSize = 10;

  const fetchInvestments = useCallback(
    async (cursor: string | null = null, cursorId: string | null = null) => {
      setLoading(true);
      try {
        const params: InvestmentFilterParams = { pageSize };

        if (assetType !== "all") params.assetType = assetType;
        if (status !== "all") params.status = status;
        if (portfolioId !== "all") params.portfolioId = portfolioId;
        if (keyword.trim()) params.keyword = keyword.trim();
        if (cursor) params.cursor = cursor;
        if (cursorId) params.cursorId = cursorId;

        const response = await investmentService.getInvestments(params);
        setInvestments(response.items);
        setTotalCount(response.totalCount);
        setNextCursor(response.nextCursor || null);
        setNextCursorId(response.nextCursorId || null);
        setHasNextPage(response.hasNextPage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("investments.feedback.loadFailed"));
      } finally {
        setLoading(false);
      }
    },
    [assetType, status, portfolioId, keyword, t]
  );

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const data = await investmentService.getDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("investments.feedback.loadFailed"));
    } finally {
      setDashboardLoading(false);
    }
  }, [t]);

  const fetchPortfolios = useCallback(async () => {
    try {
      const data = await investmentService.getPortfolios();
      setPortfolios(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("investments.feedback.loadFailed"));
    }
  }, [t]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  useEffect(() => {
    fetchInvestments(currentCursor, currentCursorId);
  }, [fetchInvestments, currentCursor, currentCursorId, refreshKey]);

  useEffect(() => {
    fetchDashboard();
    fetchPortfolios();
    fetchProfile();
  }, [fetchDashboard, fetchPortfolios, fetchProfile, refreshKey]);

  // Chatbot refresh listener
  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<ChatbotRefreshEventDetail>;
      if (customEvent.detail?.target === "investments") {
        resetPagination();
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, []);

  const resetPagination = () => {
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  };

  const handleFilterChange = (setter: (val: string) => void) => (value: string) => {
    setter(value);
    resetPagination();
  };

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

  const handleRefresh = useCallback(() => {
    resetPagination();
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleAddClick = useCallback(() => {
    setSelectedInvestment(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((investment: Investment) => {
    setSelectedInvestment(investment);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    resetPagination();
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handlePortfolioRefresh = useCallback(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <div className="space-y-6">
      <InvestmentHeader
        onAddClick={handleAddClick}
        onRefresh={handleRefresh}
        onPortfolioClick={() => setPortfolioDialogOpen(true)}
      />

      {/* Dashboard */}
      {dashboardLoading ? (
        <div className="flex items-center justify-center p-12">
          <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
        </div>
      ) : (
        dashboard && <InvestmentDashboardView dashboard={dashboard} currency={profile?.currency || "USD"} />
      )}

      {/* Filters */}
      <InvestmentFilters
        assetType={assetType}
        status={status}
        portfolioId={portfolioId}
        keyword={keyword}
        portfolios={portfolios}
        onAssetTypeChange={handleFilterChange(setAssetType)}
        onStatusChange={handleFilterChange(setStatus)}
        onPortfolioChange={handleFilterChange(setPortfolioId)}
        onKeywordChange={handleFilterChange(setKeyword)}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
        </div>
      ) : (
        <InvestmentsTable
          investments={investments}
          portfolios={portfolios}
          currentPage={currentPage}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={cursorHistory.length > 0}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteSuccess}
          currency={profile?.currency || "USD"}
        />
      )}

      {/* Dialogs */}
      <AddInvestmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        investment={selectedInvestment}
        portfolios={portfolios}
      />

      <InvestmentPortfolioDialog
        open={portfolioDialogOpen}
        onOpenChange={setPortfolioDialogOpen}
        portfolios={portfolios}
        onRefresh={handlePortfolioRefresh}
      />

    </div>
  );
}
