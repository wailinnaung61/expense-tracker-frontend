import { apiClient } from "@/lib/api";
import type {
  Investment,
  InvestmentDashboard,
  InvestmentFilterParams,
  InvestmentPortfolio,
  PaginatedResponse,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  CreateInvestmentPortfolioRequest,
  UpdateInvestmentPortfolioRequest,
} from "@/types/investment";

export const investmentService = {
  // ── Investments ────────────────────────────────────────────────────────

  getInvestments(params?: InvestmentFilterParams) {
    return apiClient.get<PaginatedResponse<Investment>>(
      "/api/Investment",
      params as Record<string, string | number | boolean | undefined>
    );
  },

  getInvestmentById(id: string) {
    return apiClient.get<Investment>(`/api/Investment/${id}`);
  },

  getDashboard() {
    return apiClient.get<InvestmentDashboard>("/api/Investment/dashboard");
  },

  createInvestment(data: CreateInvestmentRequest) {
    return apiClient.post<Investment>("/api/Investment", data);
  },

  updateInvestment(id: string, data: UpdateInvestmentRequest) {
    return apiClient.put<Investment>(`/api/Investment/${id}`, data);
  },

  deleteInvestment(id: string) {
    return apiClient.delete(`/api/Investment/${id}`);
  },

  // ── Portfolios ─────────────────────────────────────────────────────────

  getPortfolios() {
    return apiClient.get<InvestmentPortfolio[]>("/api/InvestmentPortfolio");
  },

  getPortfolioById(id: string) {
    return apiClient.get<InvestmentPortfolio>(`/api/InvestmentPortfolio/${id}`);
  },

  createPortfolio(data: CreateInvestmentPortfolioRequest) {
    return apiClient.post<InvestmentPortfolio>("/api/InvestmentPortfolio", data);
  },

  updatePortfolio(id: string, data: UpdateInvestmentPortfolioRequest) {
    return apiClient.put<InvestmentPortfolio>(`/api/InvestmentPortfolio/${id}`, data);
  },

  deletePortfolio(id: string) {
    return apiClient.delete(`/api/InvestmentPortfolio/${id}`);
  },
};
