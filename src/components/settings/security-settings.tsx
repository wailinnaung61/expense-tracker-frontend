import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { MfaSetupDialog } from "./mfa-setup-dialog";
import { authService } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "react-toastify";

import {
    CheckCircle2,
    Loader2,
    Shield,
} from "lucide-react";

export function SecuritySettings() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loadingMfaStatus, setLoadingMfaStatus] = useState(true);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);

  // Load MFA status on component mount
  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    try {
      const status = await authService.getMfaStatus();
      setMfaEnabled(status.mfaEnabled);
    } catch (error) {
      console.error("Failed to load MFA status:", error);
    } finally {
      setLoadingMfaStatus(false);
    }
  };

  const handleMfaToggle = async (checked: boolean) => {
    if (checked) {
      // Open setup dialog
      setShowMfaSetup(true);
    } else {
      // Disable MFA
      setDisablingMfa(true);
      try {
        await authService.disableMfa();
        setMfaEnabled(false);
        
        toast.success(t("settings.security.mfaDisabledMessage"));
      } catch (error: any) {
        console.error("Failed to disable MFA:", error);
        toast.error(error.message || t("settings.security.mfaDisableFailed"));
      } finally {
        setDisablingMfa(false);
      }
    }
  };

  const handleMfaSetupSuccess = () => {
    setMfaEnabled(true);
    loadMfaStatus();
  };

  return (
    <>
      <div className="space-y-6">
        {/* 2FA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              {t("settings.security.mfaTitle")}
            </CardTitle>
            <CardDescription>
              {t("settings.security.mfaDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="2fa">{t("settings.security.enableMfa")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.security.mfaHelp")}
                </p>
              </div>
              {loadingMfaStatus ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  id="2fa"
                  checked={mfaEnabled}
                  disabled={disablingMfa}
                  onCheckedChange={handleMfaToggle}
                />
              )}
            </div>

            {mfaEnabled && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-900 dark:text-green-100">
                  {t("settings.security.mfaEnabledMessage")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* MFA Setup Dialog */}
        <MfaSetupDialog
          open={showMfaSetup}
          onOpenChange={setShowMfaSetup}
          onSuccess={handleMfaSetupSuccess}
        />
      </div>
    </>
  );
}