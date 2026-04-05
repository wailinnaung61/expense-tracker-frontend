import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Wallet, Target, Receipt, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import type { NotificationPreferences } from "@/types/profile";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<NotificationPreferences>({
    budgetAlerts: true,
    recurringPayments: true,
    autoPayments: true,
    savingGoals: true,
    largeTransactions: true,
    paymentFailures: true,
    exports: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const profile = await profileService.getProfile();
      setSettings(profile.notificationPreferences);
    } catch (error: any) {
      console.error("Failed to load notification preferences:", error);
      toast.error(error?.message || "Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !settings[key];
    
    // Optimistic update
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));

    setSaving(true);
    try {
      await profileService.updateProfile({
        notificationPreferences: {
          ...settings,
          [key]: newValue
        }
      });
      
      toast.success(t("settings.notifications.updateSuccess"));
    } catch (error: any) {
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [key]: !newValue
      }));
      
      console.error("Failed to update notification preferences:", error);
      toast.error(error?.message || t("settings.notifications.updateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-11" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Alerts */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {t("settings.notifications.alertsTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.notifications.alertsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="budgetAlerts">
                  {t("settings.notifications.budgetAlerts")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.budgetAlertsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="budgetAlerts"
              checked={settings.budgetAlerts}
              disabled={saving}
              onCheckedChange={() => handleToggle("budgetAlerts")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="savingGoals">
                  {t("settings.notifications.savingGoals")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.savingGoalsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="savingGoals"
              checked={settings.savingGoals}
              disabled={saving}
              onCheckedChange={() => handleToggle("savingGoals")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="largeTransactions">
                  {t("settings.notifications.largeTransactions")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.largeTransactionsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="largeTransactions"
              checked={settings.largeTransactions}
              disabled={saving}
              onCheckedChange={() => handleToggle("largeTransactions")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recurring Payments */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {t("settings.notifications.recurringTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.notifications.recurringDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="recurringPayments">
                  {t("settings.notifications.recurringPayments")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.recurringPaymentsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="recurringPayments"
              checked={settings.recurringPayments}
              disabled={saving}
              onCheckedChange={() => handleToggle("recurringPayments")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="autoPayments">
                  {t("settings.notifications.autoPayments")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.autoPaymentsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="autoPayments"
              checked={settings.autoPayments}
              disabled={saving}
              onCheckedChange={() => handleToggle("autoPayments")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="paymentFailures">
                  {t("settings.notifications.paymentFailures")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.paymentFailuresHint")}
                </p>
              </div>
            </div>
            <Switch
              id="paymentFailures"
              checked={settings.paymentFailures}
              disabled={saving}
              onCheckedChange={() => handleToggle("paymentFailures")}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t("settings.notifications.systemTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.notifications.systemDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="exports">
                  {t("settings.notifications.exports")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.notifications.exportsHint")}
                </p>
              </div>
            </div>
            <Switch
              id="exports"
              checked={settings.exports}
              disabled={saving}
              onCheckedChange={() => handleToggle("exports")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
