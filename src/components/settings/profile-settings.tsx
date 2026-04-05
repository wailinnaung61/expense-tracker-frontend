import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import type { ProfileResponse, UpdateProfileFormData } from "@/types/profile";
import { updateProfileSchema, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/types/profile";
import { useTranslation } from "@/hooks/useTranslation";
import i18n from "@/i18n/config";

// Auth profile validation schema (userName as displayName, email)
const authProfileSchema = z.object({
  userName: z.string()
    .min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type AuthProfileFormData = z.infer<typeof authProfileSchema>;

export function ProfileSettings() {
  const { user, fetchUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);

  // Combined form data type
  type CombinedFormData = AuthProfileFormData & UpdateProfileFormData;

  // Single unified form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CombinedFormData>({
    resolver: zodResolver(authProfileSchema.merge(updateProfileSchema)),
    defaultValues: {
      userName: "",
      email: "",
      currency: "USD",
      locale: "en",
      dailyLimit: 0,
    },
  });

  const selectedCurrency = watch("currency");
  const selectedLocale = watch("locale");

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        
        // DO NOT sync locale with i18n - locale is ONLY for notification language
        // UI language is controlled separately by the language switcher
        
        // Reset all form values
        reset({
          userName: data.userName,
          email: data.email,
          phoneNumber: data.phoneNumber || "",
          currency: data.currency as any,
          locale: data.locale as any,
          dailyLimit: data.dailyLimit,
        });
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        toast.error(error?.message || t('settings.profile.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Combined form submit handler
  const onSubmit = async (data: CombinedFormData) => {
    setIsSaving(true);
    try {
      // Check if auth fields changed (userName, email)
      const authChanged = data.userName !== profile?.userName || data.email !== profile?.email;
      
      // Check if profile fields changed (phoneNumber, currency, locale, dailyLimit)
      const profileChanged = 
        data.phoneNumber !== profile?.phoneNumber ||
        data.currency !== profile?.currency ||
        data.locale !== profile?.locale ||
        data.dailyLimit !== profile?.dailyLimit;

      let emailChangedFlag = false;

      // Update auth profile if changed
      if (authChanged) {
        const updatedUser = await authService.updateAuthProfile({
          userName: data.userName,
          email: data.email,
        });
        
        // Update local profile state
        if (profile) {
          setProfile({ ...profile, userName: updatedUser.userName, email: updatedUser.email });
        }
        
        // Refresh user context
        await fetchUser();
        
        // Check if email changed
        if (data.email !== profile?.email) {
          emailChangedFlag = true;
          setPendingEmailVerification(true);
          toast.info(t('settings.profile.verificationSent'));
          setEmailVerificationOpen(true);
        }
      }

      // Update profile settings if changed
      if (profileChanged) {
        const updatedProfile = await profileService.updateProfile({
          phoneNumber: data.phoneNumber || null,
          currency: data.currency,
          locale: data.locale,
          dailyLimit: data.dailyLimit,
        });
        setProfile(updatedProfile);
        
        // DO NOT sync locale with i18n - locale is ONLY for notification language
        // UI language is controlled separately by the language switcher
        
        // Refresh user context to update currency across the app
        await fetchUser();
      }

      // Show success message only if no email change (email change shows its own message)
      if ((authChanged || profileChanged) && !emailChangedFlag) {
        toast.success(t('settings.profile.updateSuccess'));
      }
      
      reset(data);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.message || t('settings.profile.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Resend email verification
  const handleResendVerification = async () => {
    try {
      await authService.resendEmailVerification();
      toast.success(t('settings.profile.verificationResent'));
    } catch (error: any) {
      toast.error(error?.message || t('settings.profile.resendError'));
    }
  };

  // Confirm email change
  const handleConfirmEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.warning(t('settings.profile.enterCode'));
      return;
    }

    try {
      await authService.confirmEmailChange(verificationCode);
      setEmailVerificationOpen(false);
      setVerificationCode("");
      setPendingEmailVerification(false);
      
      toast.success(t('settings.profile.emailVerified'));
      
      // Refresh profile data
      const data = await profileService.getProfile();
      setProfile(data);
      reset({
        userName: data.userName,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        currency: data.currency as any,
        locale: data.locale as any,
        dailyLimit: data.dailyLimit,
      });
      await fetchUser();
    } catch (error: any) {
      toast.error(error?.message || t('settings.profile.verifyError'));
    }
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
          <CardDescription>{t('settings.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-8 border-b">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt="User"
                />
                <AvatarFallback className="text-xl">
                  {profile?.userName?.substring(0, 2).toUpperCase() || user?.userName?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{profile?.userName || user?.userName || "User"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email || ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Details Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-4">{t('settings.profile.accountDetails')}</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2 text-sm">
                        {t('settings.profile.username')}
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input
                        id="username"
                        value={user?.cognitoUserName || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.usernameHint')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userName">{t('settings.profile.displayName')}</Label>
                      <Input
                        id="userName"
                        placeholder={t('settings.profile.displayNamePlaceholder')}
                        {...register("userName")}
                        disabled={isLoading}
                      />
                      {errors.userName && (
                        <p className="text-sm text-destructive">
                          {errors.userName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('settings.profile.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('settings.profile.emailPlaceholder')}
                        {...register("email")}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                      {pendingEmailVerification && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 flex-1">
                            {t('settings.profile.verificationPending')}
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-yellow-700 dark:text-yellow-300 underline hover:text-yellow-900 dark:hover:text-yellow-100"
                            onClick={() => setEmailVerificationOpen(true)}
                          >
                            {t('settings.profile.verifyNow')}
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.emailHint')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">{t('settings.profile.phone')}</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder={t('settings.profile.phonePlaceholder')}
                        {...register("phoneNumber")}
                        disabled={isLoading}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-destructive">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-4">{t('settings.profile.preferences')}</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('settings.profile.currency')}</Label>
                      <Select
                        value={selectedCurrency}
                        onValueChange={(value) => setValue("currency", value as any, { shouldDirty: true })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder={t('settings.profile.selectCurrency')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.currency && (
                        <p className="text-sm text-destructive">
                          {errors.currency.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locale">{t('settings.profile.notificationLanguage')}</Label>
                      <Select
                        value={selectedLocale}
                        onValueChange={(value) => setValue("locale", value as any, { shouldDirty: true })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="locale">
                          <SelectValue placeholder={t('settings.profile.selectLocale')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_LOCALES.map((locale) => (
                            <SelectItem key={locale.code} value={locale.code}>
                              {locale.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.locale && (
                        <p className="text-sm text-destructive">
                          {errors.locale.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.localeHint')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyLimit">{t('settings.profile.dailyLimit')}</Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register("dailyLimit", { valueAsNumber: true })}
                        disabled={isLoading}
                      />
                      {errors.dailyLimit && (
                        <p className="text-sm text-destructive">
                          {errors.dailyLimit.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.dailyLimitHint')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading || isSaving || !isDirty}
                className="min-w-32"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSaving ? t('settings.profile.saving') : t('settings.profile.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>{t('settings.profile.verifyEmailTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.profile.verifyEmailDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-center">
              <Mail className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">{t('settings.profile.verificationCode')}</Label>
              <Input
                id="verificationCode"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              className="w-full"
            >
              {t('settings.profile.resendCode')}
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmailVerificationOpen(false);
                setVerificationCode("");
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmEmail}
              disabled={verificationCode.length !== 6}
            >
              {t('settings.profile.verifyEmail')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
