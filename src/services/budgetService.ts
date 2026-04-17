import { ApiError, apiClient } from "@/lib/api";
import { normalizeBudgetDto, normalizeBudgetMonthlyResponse } from "@/lib/budget-api-normalize";
import type {
  BudgetCategoryDto,
  BudgetDto,
  BudgetExcelExportJobResponse,
  BudgetMonthlyResponse,
  CreateBudgetCategoryRequest,
  CreateBudgetRequest,
  MessageResponse,
  UpdateBudgetCategoryRequest,
  UpdateBudgetRequest,
} from "@/types/budget";
import type { ExportDownloadResponse } from "@/types/export";

function readBudgetExcelJobId(raw: unknown): string {
  const r = raw as Record<string, unknown>;
  const v = r.jobId ?? r.JobId;
  return v != null && String(v).length > 0 ? String(v) : "";
}

function normalizeBudgetExcelDownload(raw: unknown): ExportDownloadResponse {
  const r = raw as Record<string, unknown>;
  return {
    downloadUrl: String(r.downloadUrl ?? r.DownloadUrl ?? r.url ?? ""),
    fileName: String(r.fileName ?? r.FileName ?? "budget-report.xlsx"),
    expiresAt: String(r.expiresAt ?? r.ExpiresAt ?? ""),
  };
}

export const budgetService = {
  async getBudgetByMonth(year: number, month: number) {
    const raw = await apiClient.get<BudgetMonthlyResponse>(`/api/budgets/${year}/${month}`);
    return normalizeBudgetMonthlyResponse(raw);
  },

  /** Budget whose period contains this day (yyyy-MM-dd)—correct for split pay cycles in one month. */
  async getBudgetContainingDate(date: string) {
    const raw = await apiClient.get<BudgetMonthlyResponse>(
      `/api/budgets/containing?date=${encodeURIComponent(date)}`
    );
    return normalizeBudgetMonthlyResponse(raw);
  },

  /** Same as getBudgetContainingDate but returns null on 404 (for probing month edges). */
  async getBudgetContainingDateOrNull(date: string): Promise<BudgetMonthlyResponse | null> {
    try {
      const raw = await apiClient.get<BudgetMonthlyResponse>(
        `/api/budgets/containing?date=${encodeURIComponent(date)}`
      );
      return normalizeBudgetMonthlyResponse(raw);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  },

  /** Merged budget view for every budget overlapping the inclusive date range (dashboard semantics). */
  async getBudgetByDateRange(startDate: string, endDate: string) {
    const raw = await apiClient.get<BudgetMonthlyResponse>(
      `/api/budgets/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
    return normalizeBudgetMonthlyResponse(raw);
  },

  async createBudget(data: CreateBudgetRequest) {
    const raw = await apiClient.post<BudgetDto>("/api/budgets", data);
    return normalizeBudgetDto(raw);
  },

  async updateBudget(budgetId: string, data: UpdateBudgetRequest) {
    const raw = await apiClient.put<BudgetDto>(`/api/budgets/${budgetId}`, data);
    return normalizeBudgetDto(raw);
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

  /** POST /api/budgets/{budgetId}/reports/excel — builds workbook, uploads to S3, returns export job. */
  async createBudgetExcelReport(budgetId: string) {
    const raw = await apiClient.post<unknown>(`/api/budgets/${budgetId}/reports/excel`, {});
    const jobId = readBudgetExcelJobId(raw);
    if (!jobId) {
      throw new Error("Budget export did not return a job id.");
    }
    return { ...(raw as BudgetExcelExportJobResponse), jobId };
  },

  /** GET /api/budgets/reports/{jobId}/download — presigned URL for the generated workbook. */
  async getBudgetExcelReportDownloadUrl(jobId: string) {
    const raw = await apiClient.request<unknown>(
      `/api/budgets/reports/${encodeURIComponent(jobId)}/download`,
      { method: "GET" }
    );
    return normalizeBudgetExcelDownload(raw);
  },

  /** Request report then open download (expects job ready after POST per API contract). */
  async downloadBudgetExcelReport(budgetId: string): Promise<void> {
    const postRaw = await apiClient.post<unknown>(`/api/budgets/${budgetId}/reports/excel`, {});
    const jobId = readBudgetExcelJobId(postRaw);
    if (!jobId) {
      throw new Error("Budget export did not return a job id.");
    }
    const getRaw = await apiClient.request<unknown>(
      `/api/budgets/reports/${encodeURIComponent(jobId)}/download`,
      { method: "GET" }
    );
    const download = normalizeBudgetExcelDownload(getRaw);
    if (!download.downloadUrl) {
      throw new Error("Download URL was not returned.");
    }
    const link = document.createElement("a");
    link.href = download.downloadUrl;
    link.download = download.fileName || "budget-report.xlsx";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};