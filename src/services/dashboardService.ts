import { apiClient } from "@/lib/api";
import type { DashboardResponse } from "@/types/dashboard";

export const dashboardService = {
  async getDashboard(month?: string): Promise<DashboardResponse> {
    const params = month ? `?month=${month}` : "";
    return apiClient.request<DashboardResponse>(`/api/Dashboard${params}`, {
      method: "GET",
    });
  },

  async getDashboardByRange(startDate: string, endDate: string): Promise<DashboardResponse> {
    return apiClient.get<DashboardResponse>("/api/Dashboard/custom", {
      startDate,
      endDate,
    });
  },
};
