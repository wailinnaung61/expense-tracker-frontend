import { SavingsHeader } from "@/components/savings/savings-header";
import { SavingsFilters } from "@/components/savings/savings-filters";
import { SavingsDashboardView } from "@/components/savings/savings-dashboard";
import { SavingsGoalCards } from "@/components/savings/savings-goal-cards";
import { AddSavingGoalDialog } from "@/components/savings/add-saving-goal-dialog";
import { ContributionDialog } from "@/components/savings/contribution-dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { savingsService } from "@/services/savingsService";
import { profileService } from "@/services/profileService";
import type { SavingGoal, SavingDashboard, SavingGoalFilterParams } from "@/types/savings";
import type { ProfileResponse } from "@/types/profile";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import spinnerGif from "@/assets/Spinner.gif";
import { CHATBOT_REFRESH_EVENT, type ChatbotRefreshEventDetail } from "@/lib/chatbot-refresh";

export default function Savings() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [dashboard, setDashboard] = useState<SavingDashboard | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState<string>("all");
  const [goalType, setGoalType] = useState<string>("all");
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
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [contributionGoal, setContributionGoal] = useState<SavingGoal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pageSize = 10;

  const fetchGoals = useCallback(
    async (cursor: string | null = null, cursorId: string | null = null) => {
      setLoading(true);
      try {
        const params: SavingGoalFilterParams = { pageSize };

        if (status !== "all") params.status = status;
        if (goalType !== "all") params.goalType = goalType;
        if (keyword.trim()) params.keyword = keyword.trim();
        if (cursor) params.cursor = cursor;
        if (cursorId) params.cursorId = cursorId;

        const response = await savingsService.getGoals(params);
        setGoals(response.items);
        setTotalCount(response.totalCount);
        setNextCursor(response.nextCursor || null);
        setNextCursorId(response.nextCursorId || null);
        setHasNextPage(response.hasNextPage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("savings.feedback.loadFailed"));
      } finally {
        setLoading(false);
      }
    },
    [status, goalType, keyword, t]
  );

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const data = await savingsService.getDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("savings.feedback.loadFailed"));
    } finally {
      setDashboardLoading(false);
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
    fetchGoals(currentCursor, currentCursorId);
  }, [fetchGoals, currentCursor, currentCursorId, refreshKey]);

  useEffect(() => {
    fetchDashboard();
    fetchProfile();
  }, [fetchDashboard, fetchProfile, refreshKey]);

  // Chatbot refresh listener
  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<ChatbotRefreshEventDetail>;
      if (customEvent.detail?.target === "savings") {
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
    setSelectedGoal(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((goal: SavingGoal) => {
    setSelectedGoal(goal);
    setDialogOpen(true);
  }, []);

  const handleContributeClick = useCallback((goal: SavingGoal) => {
    setContributionGoal(goal);
    setContributionDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    resetPagination();
    setRefreshKey((prev) => prev + 1);
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDeleteSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    fetchDashboard();
  }, [fetchDashboard]);

  const handleContributionSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      <SavingsHeader onAddClick={handleAddClick} onRefresh={handleRefresh} />

      {/* Dashboard */}
      {dashboardLoading ? (
        <div className="flex items-center justify-center p-12">
          <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
        </div>
      ) : (
        dashboard && (
          <SavingsDashboardView
            dashboard={dashboard}
            currency={profile?.currency || "USD"}
            onContribute={handleContributeClick}
          />
        )
      )}

      {/* Filters */}
      <SavingsFilters
        status={status}
        goalType={goalType}
        keyword={keyword}
        onStatusChange={handleFilterChange(setStatus)}
        onGoalTypeChange={handleFilterChange(setGoalType)}
        onKeywordChange={handleFilterChange(setKeyword)}
      />

      {/* Goal Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
        </div>
      ) : (
        <SavingsGoalCards
          goals={goals}
          currentPage={currentPage}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={cursorHistory.length > 0}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteSuccess}
          onContribute={handleContributeClick}
          currency={profile?.currency || "USD"}
        />
      )}

      {/* Dialogs */}
      <AddSavingGoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        goal={selectedGoal}
      />

      <ContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        onSuccess={handleContributionSuccess}
        goal={contributionGoal}
        currency={profile?.currency || "USD"}
      />
    </div>
  );
}
