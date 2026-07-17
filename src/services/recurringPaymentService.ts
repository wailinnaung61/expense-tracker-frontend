import { apiClient } from '@/lib/api';
import type {
  RecurringPayment,
  CreateRecurringPaymentRequest,
  UpdateRecurringPaymentRequest,
  RecurringPaymentListParams,
} from "@/types/recurringPayment";

export const recurringPaymentService = {
  // Get all recurring payments
  async getRecurringPayments(): Promise<RecurringPayment[]> {
    return apiClient.get<RecurringPayment[]>('/api/RecurringPayment');
  },

  // Get upcoming recurring payments
  async getUpcomingPayments(params: RecurringPaymentListParams): Promise<RecurringPayment[]> {
    if (!params.startDate || !params.endDate) {
      return [];
    }

    return apiClient.get<RecurringPayment[]>('/api/RecurringPayment/upcoming', {
      startDate: params.startDate,
      endDate: params.endDate,
    });
  },

  // Get a single recurring payment by ID
  async getRecurringPaymentById(recurringId: string): Promise<RecurringPayment> {
    return apiClient.get<RecurringPayment>(`/api/RecurringPayment/${recurringId}`);
  },

  // Create a new recurring payment
  async createRecurringPayment(
    data: CreateRecurringPaymentRequest
  ): Promise<RecurringPayment> {
    return apiClient.post<RecurringPayment>('/api/RecurringPayment', {
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId,
      frequency: data.frequency,
      nextDueDate: data.nextDueDate,
      autoPay: data.autoPay ?? false,
    });
  },

  // Update a recurring payment
  async updateRecurringPayment(
    recurringId: string,
    data: UpdateRecurringPaymentRequest
  ): Promise<RecurringPayment> {
    return apiClient.put<RecurringPayment>(`/api/RecurringPayment/${recurringId}`, {
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId,
      frequency: data.frequency,
      nextDueDate: data.nextDueDate,
      status: data.status,
      autoPay: data.autoPay ?? false,
    });
  },

  // Delete a recurring payment
  async deleteRecurringPayment(recurringId: string): Promise<void> {
    return apiClient.delete(`/api/RecurringPayment/${recurringId}`);
  },

  // Mark a recurring payment as paid (advances schedule; caller may also create a transaction)
  async markAsPaid(recurringId: string): Promise<RecurringPayment> {
    return apiClient.post<RecurringPayment>(`/api/RecurringPayment/${recurringId}/mark-paid`);
  },

  // Acknowledge paid externally (clears MissedCount without creating a transaction)
  async acknowledgePaid(recurringId: string): Promise<RecurringPayment> {
    return apiClient.post<RecurringPayment>(
      `/api/RecurringPayment/${recurringId}/acknowledge-paid`
    );
  },
};
