import { apiClient } from "@/lib/api";
import type { TransactionListParams, PaginatedResponse, Transaction, CreateTransactionRequest, UpdateTransactionRequest } from "@/types/transaction";


export const transactionService = {
  // Get transactions with filters and pagination
  getTransactions(params?: TransactionListParams) {
    return apiClient.get<PaginatedResponse<Transaction>>(
      "/api/Transaction",
      params as Record<string, string | number | boolean | undefined>
    );
  },

  getTransactionById(id: string) {
    return apiClient.get<Transaction>(`/api/Transaction/${id}`);
  },

  createTransaction(data: CreateTransactionRequest) {
    return apiClient.post<Transaction>("/api/Transaction/create", data);
  },

  updateTransaction(id: string, data: Partial<UpdateTransactionRequest>) {
    return apiClient.put<Transaction>(`/api/Transaction/${id}`, data);
  },

  deleteTransaction(id: string) {
    return apiClient.delete(`/api/Transaction/${id}`);
  },
};
