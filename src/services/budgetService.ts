import { apiClient } from "@/lib/api";
import type {
  BudgetCategoryDto,
  BudgetDto,
  BudgetMonthlyResponse,
  CreateBudgetCategoryRequest,
  CreateBudgetRequest,
  MessageResponse,
  UpdateBudgetCategoryRequest,
  UpdateBudgetRequest,
} from "@/types/budget";

export const budgetService = {
  getBudgetByMonth(year: number, month: number) {
    return apiClient.get<BudgetMonthlyResponse>(`/api/budgets/${year}/${month}`);
  },

  createBudget(data: CreateBudgetRequest) {
    return apiClient.post<BudgetDto>("/api/budgets", data);
  },

  updateBudget(budgetId: string, data: UpdateBudgetRequest) {
    return apiClient.put<BudgetDto>(`/api/budgets/${budgetId}`, data);
  },

  addBudgetCategory(budgetId: string, data: CreateBudgetCategoryRequest) {
    return apiClient.post<BudgetCategoryDto>(`/api/budgets/${budgetId}/categories`, data);
  },

  removeBudgetCategory(budgetCategoryId: string) {
    return apiClient.delete<MessageResponse>(`/api/budget-categories/${budgetCategoryId}`);
  },

  updateBudgetCategory(
    budgetCategoryId: string,
    data: UpdateBudgetCategoryRequest
  ) {
    return apiClient.put<BudgetCategoryDto>(
      `/api/budget-categories/${budgetCategoryId}`,
      data
    );
  },

  resetBudget(budgetId: string) {
    return apiClient.post<MessageResponse>(`/api/budgets/${budgetId}/reset`);
  },

  deleteBudget(budgetId: string) {
    return apiClient.delete<MessageResponse>(`/api/budgets/${budgetId}`);
  },
};