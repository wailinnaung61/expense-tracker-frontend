import { apiClient } from "@/lib/api";
import type {
  CategoryListParams,
  CreateCategoryRequest,
  ExpenseCategory,
  PaginatedResponse,
  UpdateCategoryRequest,
} from "@/types/category";

export const categoryService = {
  // Get all categories with filters
  getCategories(params?: CategoryListParams) {
    return apiClient.get<PaginatedResponse<ExpenseCategory>>(
      "/api/ExpenseCategory",
      params as Record<string, string | number | boolean | undefined>
    );
  },

  // Get category by ID
  getCategoryById(id: string) {
    return apiClient.get<ExpenseCategory>(`/api/ExpenseCategory/${id}`);
  },

  // Create new category
  createCategory(data: CreateCategoryRequest) {
    return apiClient.post<ExpenseCategory>("/api/ExpenseCategory", data);
  },

  // Update category
  updateCategory(id: string, data: UpdateCategoryRequest) {
    return apiClient.put<ExpenseCategory>(`/api/ExpenseCategory/${id}`, data);
  },

  // Delete category
  deleteCategory(id: string) {
    return apiClient.delete(`/api/ExpenseCategory/${id}`);
  },

  //Get categories by type (for dropdowns, etc.)
  getCategoriesByType(params?: CategoryListParams) {
    return apiClient.get<ExpenseCategory>(
      "/api/ExpenseCategory/list",
      params as Record<string, string | number | boolean | undefined>
    );
  },
};
