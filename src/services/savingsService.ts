import { apiClient } from "@/lib/api";
import type {
  SavingGoal,
  SavingGoalContribution,
  SavingDashboard,
  SavingGoalFilterParams,
  PaginatedResponse,
  CreateSavingGoalRequest,
  UpdateSavingGoalRequest,
  AddSavingContributionRequest,
} from "@/types/savings";

export const savingsService = {
  // ── Dashboard ──────────────────────────────────────────────────────────
  getDashboard() {
    return apiClient.get<SavingDashboard>("/api/savings/dashboard");
  },

  // ── Goals ──────────────────────────────────────────────────────────────
  getGoals(params?: SavingGoalFilterParams) {
    return apiClient.get<PaginatedResponse<SavingGoal>>(
      "/api/savings/goals",
      params as Record<string, string | number | boolean | undefined>
    );
  },

  getGoalById(id: string) {
    return apiClient.get<SavingGoal>(`/api/savings/goals/${id}`);
  },

  createGoal(data: CreateSavingGoalRequest) {
    return apiClient.post<SavingGoal>("/api/savings/goals", data);
  },

  updateGoal(id: string, data: UpdateSavingGoalRequest) {
    return apiClient.put<SavingGoal>(`/api/savings/goals/${id}`, data);
  },

  deleteGoal(id: string) {
    return apiClient.delete(`/api/savings/goals/${id}`);
  },

  // ── Contributions ──────────────────────────────────────────────────────
  getContributions(
    goalId: string,
    pageSize: number = 10,
    cursor?: string,
    cursorId?: string
  ) {
    const params: Record<string, string | number> = { pageSize };
    if (cursor) params.cursor = cursor;
    if (cursorId) params.cursorId = cursorId;
    return apiClient.get<PaginatedResponse<SavingGoalContribution>>(
      `/api/savings/goals/${goalId}/contributions`,
      params
    );
  },

  addContribution(goalId: string, data: AddSavingContributionRequest) {
    return apiClient.post<SavingGoalContribution>(
      `/api/savings/goals/${goalId}/contributions`,
      data
    );
  },

  deleteContribution(goalId: string, contributionId: string) {
    return apiClient.delete(
      `/api/savings/goals/${goalId}/contributions/${contributionId}`
    );
  },
};
