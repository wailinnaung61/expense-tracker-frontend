import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MfaSetupDialog } from "./mfa-setup-dialog";
import { authService } from "@/services/authService";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/types/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Shield,
} from "lucide-react";

export function SecuritySettings() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loadingMfaStatus, setLoadingMfaStatus] = useState(true);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    loadMfaStatus();
  }, []);

  useEffect(() => {
    if (!passwordChangeOpen) {
      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [passwordChangeOpen, reset]);

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
      setShowMfaSetup(true);
    } else {
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

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      const response = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(
        response.message || t("settings.security.changePasswordSuccess")
      );
      setPasswordChangeOpen(false);
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(
        error.message || t("settings.security.changePasswordFailed")
      );
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary shrink-0" />
              {t("settings.security.changePasswordTitle")}
            </CardTitle>
            <CardDescription>
              {t("settings.security.changePasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>{t("settings.security.passwordLabel")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.security.passwordHelp")}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPasswordChangeOpen(true)}
              >
                {t("settings.security.changePassword")}
              </Button>
            </div>
          </CardContent>
        </Card>

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

        <MfaSetupDialog
          open={showMfaSetup}
          onOpenChange={setShowMfaSetup}
          onSuccess={handleMfaSetupSuccess}
        />
      </div>

      <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("settings.security.changePasswordTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("settings.security.changePasswordDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onChangePassword)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("settings.security.currentPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("currentPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t("settings.security.newPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("settings.security.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordChangeOpen(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("settings.security.changingPassword")}
                  </>
                ) : (
                  t("settings.security.changePassword")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
