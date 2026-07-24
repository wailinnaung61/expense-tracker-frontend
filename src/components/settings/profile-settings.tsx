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
import { Loader2, Mail, Lock, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import type {
  AvatarPreset,
  ProfileResponse,
  UpdateProfileFormData,
} from "@/types/profile";
import { updateProfileSchema, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/types/profile";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Auth profile validation schema (userName as displayName, email)
const authProfileSchema = z.object({
  userName: z.string()
    .min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type AuthProfileFormData = z.infer<typeof authProfileSchema>;

export function ProfileSettings() {
  const { user, fetchUser, setAvatarUrl } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [presets, setPresets] = useState<AvatarPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [cartoonOpen, setCartoonOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const displayName = profile?.userName || user?.userName || "User";
  const displayEmail = profile?.email || user?.email || "";
  const avatarInitials = (() => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || "US";
  })();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [data, presetList] = await Promise.all([
          profileService.getProfile(),
          profileService.getAvatarPresets().catch(() => [] as AvatarPreset[]),
        ]);
        setProfile(data);
        setPresets(presetList);
        
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

  const applyProfileAvatar = (updated: ProfileResponse) => {
    setProfile(updated);
    setAvatarUrl(updated.avatar?.url?.trim() || null);
  };

  const handleSelectPreset = async (presetId: string) => {
    if (avatarBusy) return;
    setAvatarBusy(true);
    try {
      const updated = await profileService.selectAvatarPreset({ presetId });
      applyProfileAvatar(updated);
      setCartoonOpen(false);
      toast.success(t("settings.profile.avatarUpdated"));
    } catch (error: any) {
      toast.error(error?.message || t("settings.profile.avatarUpdateError"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error(t("settings.profile.avatarInvalidType"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t("settings.profile.avatarTooLarge"));
      return;
    }

    setAvatarBusy(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      applyProfileAvatar(updated);
      toast.success(t("settings.profile.avatarUpdated"));
    } catch (error: any) {
      toast.error(error?.message || t("settings.profile.avatarUpdateError"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveUpload = async () => {
    if (avatarBusy) return;
    setAvatarBusy(true);
    try {
      const updated = await profileService.removeAvatar();
      applyProfileAvatar(updated);
      toast.success(t("settings.profile.avatarRemoved"));
    } catch (error: any) {
      toast.error(error?.message || t("settings.profile.avatarUpdateError"));
    } finally {
      setAvatarBusy(false);
    }
  };

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
            <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
              <div className="flex items-center gap-5 sm:gap-6">
                <button
                  type="button"
                  className="rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-[3px] shadow-sm transition hover:scale-[1.02]"
                  onClick={() => setCartoonOpen(true)}
                  aria-label={t("settings.profile.chooseCartoon")}
                >
                  <Avatar className="h-20 w-20 border border-white/60 dark:border-slate-700">
                    <AvatarImage
                      src={profile?.avatar?.url || ""}
                      alt={displayName}
                      key={profile?.avatar?.url || "fallback"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-xl font-semibold text-primary-foreground">
                      {avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="truncate text-lg font-semibold">{displayName}</h3>
                  <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      disabled={avatarBusy}
                      onClick={() => setCartoonOpen(true)}
                    >
                      {t("settings.profile.chooseCartoon")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={avatarBusy}
                      onClick={handleUploadClick}
                    >
                      {avatarBusy ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.profile.uploadPhoto")}
                    </Button>
                    {profile?.avatar?.source === "upload" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={avatarBusy}
                        onClick={() => void handleRemoveUpload()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("settings.profile.removePhoto")}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.profile.avatarHint")}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => void handleFileChange(e)}
                  />
                </div>
              </div>
            </div>

            <Dialog open={cartoonOpen} onOpenChange={setCartoonOpen}>
              <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-2xl">
                <div className="bg-linear-to-br from-sky-500/15 via-violet-500/10 to-amber-500/10 px-6 pb-4 pt-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {t("settings.profile.cartoonDialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("settings.profile.cartoonDialogDescription")}
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="grid grid-cols-4 gap-3 p-6">
                  {presets.map((preset) => {
                    const selected =
                      profile?.avatar?.source === "preset" &&
                      profile.avatar.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={avatarBusy}
                        title={preset.label}
                        onClick={() => void handleSelectPreset(preset.id)}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected
                            ? "border-primary shadow-md ring-2 ring-primary/25"
                            : "border-border/60 hover:border-primary/40"
                        )}
                        style={{ backgroundColor: `${preset.accentColor}28` }}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                        {selected && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                            ✓
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 bg-black/35 px-1 py-0.5 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {avatarBusy && (
                  <div className="flex items-center justify-center gap-2 border-t px-6 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </div>
                )}
              </DialogContent>
            </Dialog>

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
