import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  KeyRound, 
  Shield, 
  Smartphone,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";

interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type SetupStep = "loading" | "scan" | "verify" | "complete";

export function MfaSetupDialog({ open, onOpenChange, onSuccess }: MfaSetupDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<SetupStep>("loading");
  const [secretCode, setSecretCode] = useState("");
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [session, setSession] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger MFA setup when dialog opens
  useEffect(() => {
    if (open) {
      startMfaSetup();
    } else {
      // Reset state when dialog closes
      setStep("loading");
      setSecretCode("");
      setQrCodeUri("");
      setSession("");
      setVerificationCode("");
      setBackupCodes([]);
      setError(null);
    }
  }, [open]);

  const startMfaSetup = async () => {
    setStep("loading");
    setError(null);
    try {
      console.log("🔐 Starting MFA setup...");
      const response = await authService.setupMfa();
      console.log("✅ MFA setup response:", response);
      setSecretCode(response.secretCode);
      setQrCodeUri(response.qrCodeUri);
      setSession(response.session);
      setStep("scan");
    } catch (err: any) {
      console.error("❌ Failed to setup MFA:", err);
      console.error("Error details:", err.message, err.response);
      const errorMessage = err.response?.data?.message || err.message || t("settings.security.mfaSetupFailed");
      toast.error(errorMessage);
      onOpenChange(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretCode);
    toast.success(t("settings.security.secretCopied"));
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError(t("settings.security.invalidCodeLength"));
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await authService.verifyMfaSetup({
        totpCode: verificationCode,
        session: session,
      });

      if (response.success) {
        setBackupCodes(response.backUpCodes);
        setStep("complete");
        toast.success(t("settings.security.mfaSetupSuccess"));
      } else {
        setError(response.message || t("settings.security.verificationFailed"));
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err.message || t("settings.security.verificationFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mfa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("settings.security.backupCodesDownloaded"));
  };

  const handleComplete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {step === "complete" 
              ? t("settings.security.mfaSetupComplete") 
              : t("settings.security.setupMfaTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "scan" && t("settings.security.mfaSetupDescription")}
            {step === "verify" && t("settings.security.mfaVerifyDescription")}
            {step === "complete" && t("settings.security.mfaCompleteDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("settings.security.preparingMfa")}
            </p>
          </div>
        )}

        {/* Step 1: Scan QR Code */}
        {step === "scan" && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 bg-white dark:bg-gray-900">
                <QRCodeSVG 
                  value={qrCodeUri} 
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                {t("settings.security.scanWithApp")}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                {t("settings.security.manualEntry")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={secretCode}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.security.manualEntryHelp")}
              </p>
            </div>

            {/* Next Button */}
            <Button 
              className="w-full" 
              onClick={() => setStep("verify")}
            >
              {t("settings.security.nextVerify")}
            </Button>
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify" && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("settings.security.verifyCodeTitle")}</AlertTitle>
              <AlertDescription>
                {t("settings.security.verifyCodeDescription")}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="code">{t("settings.security.verificationCode")}</Label>
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("scan")}
              >
                {t("common.back")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? t("common.verifying") : t("common.verify")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete - Show Backup Codes */}
        {step === "complete" && (
          <div className="space-y-6">
            {/* Success Message */}
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-900 dark:text-green-100">
                {t("settings.security.mfaSetupSuccessTitle")}
              </AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200">
                {t("settings.security.mfaSetupSuccessMessage")}
              </AlertDescription>
            </Alert>

            {/* Backup Codes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {t("settings.security.backupCodes")}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackupCodes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("common.download")}
                </Button>
              </div>
              
              <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 dark:text-yellow-100 text-sm">
                  {t("settings.security.backupCodesWarning")}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md bg-muted/30">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-background rounded px-3 py-2 text-sm font-mono border"
                  >
                    <span>{code}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        toast.success(t("settings.security.codeCopied"));
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Button */}
            <Button className="w-full" onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t("common.done")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
