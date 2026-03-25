// Backend: AppConstants.RecurringStatus enum (returned as uppercase strings)
export const RecurringStatus = {
  Active: 0,
  Paused: 1,
  Completed: 2,
} as const;

export type RecurringStatusType = typeof RecurringStatus[keyof typeof RecurringStatus];

// Helper to map status string to enum value
export const getRecurringStatusValue = (status: string): number => {
  const statusMap: Record<string, number> = {
    'ACTIVE': RecurringStatus.Active,
    'PAUSED': RecurringStatus.Paused,
    'COMPLETED': RecurringStatus.Completed,
  };
  return statusMap[status.toUpperCase()] ?? RecurringStatus.Active;
};

// Backend: AppConstants.RecurringFrequency enum
export const RecurringFrequency = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
  Yearly: 3,
} as const;

export type RecurringFrequencyType = typeof RecurringFrequency[keyof typeof RecurringFrequency];

// Backend: RecurringPaymentDto
export interface RecurringPayment {
  recurringId: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName?: string; // Nullable in backend
  frequency: string; // Backend returns uppercase string (e.g., "MONTHLY")
  nextDueDate: string; // Backend: yyyy-MM-dd format
  lastPaidDate?: string; // Nullable in backend: string?
  missedCount: number;
  status: string; // Backend returns uppercase string (e.g., "ACTIVE")
  createdAt: string; // Backend: DateTime serialized to string
  updatedAt: string; // Backend: DateTime serialized to string
}

// Backend: CreateRecurringPaymentRequest
export interface CreateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string; // Backend: Guid
  frequency: number; // Backend: AppConstants.RecurringFrequency enum
  nextDueDate: string; // Backend expects yyyy-MM-dd format
}

// Backend: UpdateRecurringPaymentRequest
export interface UpdateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string; // Backend: Guid
  frequency: number; // Backend: AppConstants.RecurringFrequency enum
  nextDueDate: string; // Backend expects yyyy-MM-dd format
  status: number; // Backend: AppConstants.RecurringStatus enum
}

export interface RecurringPaymentListParams {
  startDate?: string;
  endDate?: string;
}
