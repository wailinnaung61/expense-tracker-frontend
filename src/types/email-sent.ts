import type { NotificationPreferences } from "@/types/profile";

export type EmailSentStatus = "Pending" | "Sent" | "Failed" | "Skipped";

export interface EmailQuietHours {
  startHour: number;
  endHour: number;
}

export interface EmailTimings {
  recurringDueDaysBefore: number[];
  recurringDueOnDueDate: boolean;
  recurringOverdueDaysAfter: number[];
  savingGoalDeadlineDaysBefore: number;
}

export interface EmailSettingsResponse {
  emailFeatureEnabled: boolean;
  notifyEmailEnabled: boolean;
  notificationPreferences: NotificationPreferences;
  timings: EmailTimings;
  quietHours: EmailQuietHours;
  templateTypes: string[];
}

export interface UpdateEmailSettingsRequest {
  /** Partial update — omit to leave unchanged (matches backend bool?). */
  notifyEmailEnabled?: boolean;
  notificationPreferences?: NotificationPreferences;
}

export interface EmailSentLogDto {
  id: string;
  toAddress: string;
  type: string;
  subject: string;
  locale: string;
  status: EmailSentStatus | string;
  error: string | null;
  referenceId: string | null;
  /** e.g. due-in-7d bucket for recurring emails */
  milestone: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface PagedEmailSentResult {
  items: EmailSentLogDto[];
  totalCount: number;
  hasNextPage: boolean;
  /** ISO datetime string from backend DateTime? cursor */
  nextCursor: string | null;
}

export interface EmailSentFilters {
  status?: EmailSentStatus | string;
  pageSize?: number;
  cursor?: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  budgetAlerts: true,
  recurringPayments: true,
  autoPayments: true,
  savingGoals: true,
  largeTransactions: true,
  paymentFailures: true,
  exports: true,
};
