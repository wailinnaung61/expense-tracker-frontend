// Backend: AppConstants.RecurringStatus enum (returned as uppercase strings)
export const RecurringStatus = {
  Active: 0,
  Paused: 1,
  Completed: 2,
} as const;

export type RecurringStatusType = typeof RecurringStatus[keyof typeof RecurringStatus];
export type RecurringStatusLabel = "ACTIVE" | "PAUSED" | "COMPLETED";

// Helper to map status string to enum value
export const getRecurringStatusValue = (status: string): RecurringStatusType => {
  const statusMap: Record<string, RecurringStatusType> = {
    ACTIVE: RecurringStatus.Active,
    PAUSED: RecurringStatus.Paused,
    COMPLETED: RecurringStatus.Completed,
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
export type RecurringFrequencyLabel = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export const getRecurringFrequencyValue = (
  frequency: string
): RecurringFrequencyType => {
  const frequencyMap: Record<string, RecurringFrequencyType> = {
    DAILY: RecurringFrequency.Daily,
    WEEKLY: RecurringFrequency.Weekly,
    MONTHLY: RecurringFrequency.Monthly,
    YEARLY: RecurringFrequency.Yearly,
  };

  return frequencyMap[frequency.toUpperCase()] ?? RecurringFrequency.Monthly;
};

// Backend: RecurringPaymentDto
export interface RecurringPayment {
  recurringId: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string | null;
  frequency: RecurringFrequencyLabel;
  nextDueDate: string;
  lastPaidDate: string | null;
  missedCount: number;
  status: RecurringStatusLabel;
  createdAt: string;
  updatedAt: string;
}

// Backend: CreateRecurringPaymentRequest
export interface CreateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string; // Backend: Guid
  frequency: RecurringFrequencyType; // Backend: AppConstants.RecurringFrequency enum
  nextDueDate: string; // Backend expects yyyy-MM-dd format
  autoPay?: boolean; // Optional: default false on backend
}

// Backend: UpdateRecurringPaymentRequest
export interface UpdateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string; // Backend: Guid
  frequency: RecurringFrequencyType; // Backend: AppConstants.RecurringFrequency enum
  nextDueDate: string; // Backend expects yyyy-MM-dd format
  status: RecurringStatusType; // Backend: AppConstants.RecurringStatus enum
}

export interface RecurringPaymentListParams {
  startDate: string;
  endDate: string;
}
