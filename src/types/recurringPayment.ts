export const RecurringStatus = {
  Active: "Active",
  Paused: "Paused",
  Completed: "Completed",
} as const;

export type RecurringStatusType = typeof RecurringStatus[keyof typeof RecurringStatus];

export const RecurringFrequency = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
  Yearly: 3,
} as const;

export type RecurringFrequencyType = typeof RecurringFrequency[keyof typeof RecurringFrequency];

export interface RecurringPayment {
  recurringId: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  frequency: string;
  nextDueDate: string;
  lastPaidDate: string;
  missedCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string;
  frequency: number;
  nextDueDate: string;
}

export interface UpdateRecurringPaymentRequest {
  name: string;
  amount: number;
  categoryId: string;
  frequency: number;
  nextDueDate: string;
}

export interface RecurringPaymentListParams {
  startDate?: string;
  endDate?: string;
}
