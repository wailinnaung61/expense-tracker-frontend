import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { emailSentService } from "@/services/emailSentService";
import type {
  EmailSentLogDto,
  EmailSettingsResponse,
  PagedEmailSentResult,
} from "@/types/email-sent";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types/email-sent";
import type { NotificationPreferences } from "@/types/profile";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  Mail,
  Target,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

type PrefKey = keyof NotificationPreferences;
type StatusFilter = "all" | "Pending" | "Sent" | "Failed" | "Skipped";

/** Email types still supported after export emails were removed. */
const VISIBLE_EMAIL_TYPES = [
  "BUDGET_THRESHOLD_REACHED",
  "BUDGET_EXCEEDED",
  "LARGE_TRANSACTION",
  "PAYMENT_FAILED",
  "RECURRING_PAYMENT_DUE",
  "RECURRING_PAYMENT_OVERDUE",
  "RECURRING_PAYMENT_AUTO_PAID",
  "SAVING_GOAL_DEADLINE_NEAR",
  "SAVING_GOAL_REACHED",
] as const;

const PREF_ROWS: {
  key: PrefKey;
  icon: typeof Wallet;
  titleKey: string;
  hintKey: string;
}[] = [
  {
    key: "budgetAlerts",
    icon: Wallet,
    titleKey: "emailSent.prefs.budgetAlerts",
    hintKey: "emailSent.prefs.budgetAlertsHint",
  },
  {
    key: "savingGoals",
    icon: Target,
    titleKey: "emailSent.prefs.savingGoals",
    hintKey: "emailSent.prefs.savingGoalsHint",
  },
  {
    key: "largeTransactions",
    icon: Calendar,
    titleKey: "emailSent.prefs.largeTransactions",
    hintKey: "emailSent.prefs.largeTransactionsHint",
  },
  {
    key: "recurringPayments",
    icon: Bell,
    titleKey: "emailSent.prefs.recurringPayments",
    hintKey: "emailSent.prefs.recurringPaymentsHint",
  },
  {
    key: "autoPayments",
    icon: CheckCircle2,
    titleKey: "emailSent.prefs.autoPayments",
    hintKey: "emailSent.prefs.autoPaymentsHint",
  },
  {
    key: "paymentFailures",
    icon: AlertTriangle,
    titleKey: "emailSent.prefs.paymentFailures",
    hintKey: "emailSent.prefs.paymentFailuresHint",
  },
];

function statusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "sent":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "failed":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
    case "skipped":
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400";
    default:
      return "";
  }
}

function formatMaybeDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = parseISO(value);
    if (Number.isNaN(d.getTime())) return value;
    return format(d, "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function formatRelative(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const d = parseISO(value);
    if (Number.isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

export function EmailSentSettings() {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailSettingsResponse | null>(null);

  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<PagedEmailSentResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageSize] = useState(20);

  const loadSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const data = await emailSentService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : t("emailSent.error.loadSettings")
      );
    } finally {
      setSettingsLoading(false);
    }
  }, [t]);

  const loadHistory = useCallback(
    async (cursor?: string, reset = false) => {
      try {
        setHistoryLoading(true);
        const data = await emailSentService.getHistory({
          pageSize,
          cursor,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        setHistory((prev) =>
          reset || !prev
            ? data
            : {
                ...data,
                items: [...prev.items, ...data.items],
              }
        );
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : t("emailSent.error.loadHistory")
        );
      } finally {
        setHistoryLoading(false);
      }
    },
    [pageSize, statusFilter, t]
  );

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    void loadHistory(undefined, true);
  }, [loadHistory]);

  const persistSettings = async (
    next: Pick<EmailSettingsResponse, "notifyEmailEnabled" | "notificationPreferences">
  ) => {
    if (!settings?.emailFeatureEnabled) return;

    setSaving(true);
    try {
      const updated = await emailSentService.updateSettings({
        notifyEmailEnabled: next.notifyEmailEnabled,
        notificationPreferences: next.notificationPreferences,
      });
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              timings: prev.timings,
              quietHours: prev.quietHours,
              templateTypes: prev.templateTypes,
              emailFeatureEnabled: prev.emailFeatureEnabled,
            }
          : updated
      );
      toast.success(t("emailSent.success.saved"));
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : t("emailSent.error.saveFailed")
      );
      await loadSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleMasterToggle = async (checked: boolean) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, notifyEmailEnabled: checked } : prev));
    await persistSettings({
      notifyEmailEnabled: checked,
      notificationPreferences: settings.notificationPreferences,
    });
  };

  const handlePrefToggle = async (key: PrefKey) => {
    if (!settings) return;
    const prefs = {
      ...settings.notificationPreferences,
      [key]: !settings.notificationPreferences[key],
    };
    setSettings((prev) =>
      prev ? { ...prev, notificationPreferences: prefs } : prev
    );
    await persistSettings({
      notifyEmailEnabled: settings.notifyEmailEnabled,
      notificationPreferences: prefs,
    });
  };

  const prefs = settings?.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
  const featureOff = settings != null && !settings.emailFeatureEnabled;
  const emailOff = !settings?.notifyEmailEnabled;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{t("emailSent.subtitle")}</p>
      </div>

      {featureOff && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("emailSent.featureDisabledTitle")}</AlertTitle>
          <AlertDescription>{t("emailSent.featureDisabledDesc")}</AlertDescription>
        </Alert>
      )}

      {/* Settings */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            {t("emailSent.settingsTitle")}
          </CardTitle>
          <CardDescription>{t("emailSent.settingsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 rounded-2xl border bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notify-email" className="text-base font-medium">
                    {t("emailSent.masterToggle")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("emailSent.masterToggleHint")}
                  </p>
                </div>
                <Switch
                  id="notify-email"
                  checked={!!settings?.notifyEmailEnabled}
                  disabled={saving || featureOff}
                  onCheckedChange={(checked) => void handleMasterToggle(checked)}
                />
              </div>

              <div
                className={cn(
                  "space-y-5",
                  (featureOff || emailOff) && "pointer-events-none opacity-50"
                )}
              >
                <div>
                  <h3 className="text-sm font-medium">{t("emailSent.categoriesTitle")}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t("emailSent.categoriesHint")}
                  </p>
                </div>

                {PREF_ROWS.map(({ key, icon: Icon, titleKey, hintKey }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <Label htmlFor={`email-pref-${key}`}>{t(titleKey as any)}</Label>
                        <p className="text-sm text-muted-foreground">{t(hintKey as any)}</p>
                      </div>
                    </div>
                    <Switch
                      id={`email-pref-${key}`}
                      checked={prefs[key]}
                      disabled={saving || featureOff || emailOff}
                      onCheckedChange={() => void handlePrefToggle(key)}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed bg-muted/10 p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <Info className="h-4 w-4 text-primary" />
                  {t("emailSent.largeTxNoteTitle")}
                </div>
                <p className="text-muted-foreground">{t("emailSent.largeTxNoteDesc")}</p>
                <Button
                  type="button"
                  variant="link"
                  className="mt-1 h-auto px-0"
                  onClick={() => setSearchParams({ tab: "profile" })}
                >
                  {t("emailSent.openProfileSettings")}
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Read-only timings */}
      {!settingsLoading && settings && (
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              {t("emailSent.timingsTitle")}
            </CardTitle>
            <CardDescription>{t("emailSent.timingsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div className="rounded-xl border bg-card px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("emailSent.billDue")}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {settings.timings.recurringDueDaysBefore.length > 0
                  ? t("emailSent.billDueValue", {
                      days: settings.timings.recurringDueDaysBefore.join(", "),
                      onDue: settings.timings.recurringDueOnDueDate
                        ? t("emailSent.billDueAlsoOnDueDate")
                        : "",
                    })
                  : t("emailSent.notConfigured")}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("emailSent.billOverdue")}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {t("emailSent.billOverdueValue")}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("emailSent.goalDeadline")}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {t("emailSent.goalDeadlineValue", {
                  days: settings.timings.savingGoalDeadlineDaysBefore,
                })}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("emailSent.quietHours")}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {t("emailSent.quietHoursValue", {
                  start: String(settings.quietHours.startHour).padStart(2, "0"),
                  end: String(settings.quietHours.endHour).padStart(2, "0"),
                })}
              </p>
            </div>
            <div className="sm:col-span-2">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                {t("emailSent.templateTypes")}
              </div>
              <div className="flex flex-wrap gap-2">
                {VISIBLE_EMAIL_TYPES.map((type) => (
                  <Badge key={type} variant="outline" className="font-mono text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{t("emailSent.historyTitle")}</CardTitle>
              <CardDescription>{t("emailSent.historyDescription")}</CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t("emailSent.filter.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("emailSent.filter.all")}</SelectItem>
                <SelectItem value="Sent">{t("emailSent.filter.sent")}</SelectItem>
                <SelectItem value="Pending">{t("emailSent.filter.pending")}</SelectItem>
                <SelectItem value="Failed">{t("emailSent.filter.failed")}</SelectItem>
                <SelectItem value="Skipped">{t("emailSent.filter.skipped")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {historyLoading && !history ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !history?.items.length ? (
            <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
              <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">{t("emailSent.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("emailSent.emptyDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.items.map((item) => (
                <EmailHistoryRow key={item.id} item={item} />
              ))}

              {history.hasNextPage && history.nextCursor && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    disabled={historyLoading}
                    onClick={() => void loadHistory(history.nextCursor!, false)}
                  >
                    {historyLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("emailSent.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmailHistoryRow({ item }: { item: EmailSentLogDto }) {
  const { t } = useTranslation();
  const relative = formatRelative(item.sentAt || item.createdAt);

  return (
    <div className="rounded-2xl border bg-card p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusBadgeClass(item.status)}>
              {item.status}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              {item.type}
            </Badge>
            {item.locale && (
              <Badge variant="secondary" className="uppercase">
                {item.locale}
              </Badge>
            )}
            {item.milestone && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {item.milestone}
              </Badge>
            )}
          </div>
          <p className="truncate font-medium text-foreground">{item.subject || "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{item.toAddress}</p>
          {item.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{item.error}</p>
          )}
        </div>
        <div className="shrink-0 text-left text-xs text-muted-foreground sm:text-right">
          <div>{formatMaybeDate(item.sentAt || item.createdAt)}</div>
          {relative && <div className="mt-0.5">{relative}</div>}
          {item.sentAt && item.createdAt !== item.sentAt && (
            <div className="mt-1 opacity-70">
              {t("emailSent.createdAt")}: {formatMaybeDate(item.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
