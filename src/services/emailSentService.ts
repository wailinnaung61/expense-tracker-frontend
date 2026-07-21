import { apiClient } from "@/lib/api";
import type {
  EmailSentFilters,
  EmailSettingsResponse,
  PagedEmailSentResult,
  UpdateEmailSettingsRequest,
} from "@/types/email-sent";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types/email-sent";

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => asNumber(v)).filter((n) => Number.isFinite(n));
}

function normalizeSettings(raw: EmailSettingsResponse): EmailSettingsResponse {
  const r = raw as unknown as Record<string, unknown>;
  const prefs = ((raw.notificationPreferences ??
    r.NotificationPreferences) ??
    {}) as unknown as Record<string, unknown>;
  const timings = ((raw.timings ?? r.Timings) ??
    {}) as unknown as Record<string, unknown>;
  const quiet = ((raw.quietHours ?? r.QuietHours) ??
    {}) as unknown as Record<string, unknown>;

  return {
    emailFeatureEnabled: asBoolean(
      raw.emailFeatureEnabled ?? r.EmailFeatureEnabled,
      true
    ),
    notifyEmailEnabled: asBoolean(
      raw.notifyEmailEnabled ?? r.NotifyEmailEnabled,
      false
    ),
    notificationPreferences: {
      budgetAlerts: asBoolean(
        prefs.budgetAlerts ?? prefs.BudgetAlerts,
        DEFAULT_NOTIFICATION_PREFERENCES.budgetAlerts
      ),
      recurringPayments: asBoolean(
        prefs.recurringPayments ?? prefs.RecurringPayments,
        DEFAULT_NOTIFICATION_PREFERENCES.recurringPayments
      ),
      autoPayments: asBoolean(
        prefs.autoPayments ?? prefs.AutoPayments,
        DEFAULT_NOTIFICATION_PREFERENCES.autoPayments
      ),
      savingGoals: asBoolean(
        prefs.savingGoals ?? prefs.SavingGoals,
        DEFAULT_NOTIFICATION_PREFERENCES.savingGoals
      ),
      largeTransactions: asBoolean(
        prefs.largeTransactions ?? prefs.LargeTransactions,
        DEFAULT_NOTIFICATION_PREFERENCES.largeTransactions
      ),
      paymentFailures: asBoolean(
        prefs.paymentFailures ?? prefs.PaymentFailures,
        DEFAULT_NOTIFICATION_PREFERENCES.paymentFailures
      ),
      exports: asBoolean(
        prefs.exports ?? prefs.Exports,
        DEFAULT_NOTIFICATION_PREFERENCES.exports
      ),
    },
    timings: {
      recurringDueDaysBefore: asNumberArray(
        timings.recurringDueDaysBefore ?? timings.RecurringDueDaysBefore
      ),
      recurringDueOnDueDate: asBoolean(
        timings.recurringDueOnDueDate ?? timings.RecurringDueOnDueDate,
        true
      ),
      recurringOverdueDaysAfter: asNumberArray(
        timings.recurringOverdueDaysAfter ?? timings.RecurringOverdueDaysAfter
      ),
      savingGoalDeadlineDaysBefore: asNumber(
        timings.savingGoalDeadlineDaysBefore ??
          timings.SavingGoalDeadlineDaysBefore,
        7
      ),
    },
    quietHours: {
      startHour: asNumber(quiet.startHour ?? quiet.StartHour, 22),
      endHour: asNumber(quiet.endHour ?? quiet.EndHour, 8),
    },
    templateTypes: asStringArray(raw.templateTypes ?? r.TemplateTypes),
  };
}

function normalizeHistory(raw: PagedEmailSentResult): PagedEmailSentResult {
  const r = raw as unknown as Record<string, unknown>;
  const items = (raw.items ?? r.Items ?? []) as unknown[];
  return {
    items: items.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: String(row.id ?? row.Id ?? ""),
        toAddress: String(row.toAddress ?? row.ToAddress ?? ""),
        type: String(row.type ?? row.Type ?? ""),
        subject: String(row.subject ?? row.Subject ?? ""),
        locale: String(row.locale ?? row.Locale ?? ""),
        status: String(row.status ?? row.Status ?? ""),
        error: (row.error ?? row.Error ?? null) as string | null,
        referenceId: (row.referenceId ?? row.ReferenceId ?? null) as string | null,
        milestone: (row.milestone ?? row.Milestone ?? null) as string | null,
        createdAt: String(row.createdAt ?? row.CreatedAt ?? ""),
        sentAt: (() => {
          const v = row.sentAt ?? row.SentAt;
          return v == null || v === "" ? null : String(v);
        })(),
      };
    }),
    totalCount: asNumber(raw.totalCount ?? r.TotalCount),
    hasNextPage: asBoolean(raw.hasNextPage ?? r.HasNextPage, false),
    nextCursor: (() => {
      const v = raw.nextCursor ?? r.NextCursor;
      if (v == null || v === "") return null;
      return String(v);
    })(),
  };
}

export const emailSentService = {
  async getSettings(): Promise<EmailSettingsResponse> {
    const raw = await apiClient.request<EmailSettingsResponse>("/api/email-settings", {
      method: "GET",
    });
    return normalizeSettings(raw);
  },

  async updateSettings(
    data: UpdateEmailSettingsRequest
  ): Promise<EmailSettingsResponse> {
    const raw = await apiClient.request<EmailSettingsResponse>("/api/email-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return normalizeSettings(raw);
  },

  async getHistory(filters?: EmailSentFilters): Promise<PagedEmailSentResult> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", String(filters.status));
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));
    if (filters?.cursor) params.append("cursor", filters.cursor);

    const query = params.toString();
    const raw = await apiClient.request<PagedEmailSentResult>(
      `/api/email-sent${query ? `?${query}` : ""}`,
      { method: "GET" }
    );
    return normalizeHistory(raw);
  },
};
