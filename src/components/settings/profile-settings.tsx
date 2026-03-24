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
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import type { ProfileResponse, UpdateProfileFormData } from "@/types/profile";
import { updateProfileSchema, SUPPORTED_CURRENCIES } from "@/types/profile";

// Auth profile validation schema (userName as displayName, email)
const authProfileSchema = z.object({
  userName: z.string()
    .min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type AuthProfileFormData = z.infer<typeof authProfileSchema>;

export function ProfileSettings() {
  const { user, fetchUser } = useAuth();
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
      dailyLimit: 0,
    },
  });

  const selectedCurrency = watch("currency");

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        
        // Reset all form values
        reset({
          userName: data.userName,
          email: data.email,
          phoneNumber: data.phoneNumber || "",
          currency: data.currency as any,
          dailyLimit: data.dailyLimit,
        });
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        toast.error(error?.message || "Failed to load profile settings");
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
      
      // Check if profile fields changed (phoneNumber, currency, dailyLimit)
      const profileChanged = 
        data.phoneNumber !== profile?.phoneNumber ||
        data.currency !== profile?.currency ||
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
          toast.info("Verification code has been sent to your new email address. Please check your inbox.");
          setEmailVerificationOpen(true);
        }
      }

      // Update profile settings if changed
      if (profileChanged) {
        const updatedProfile = await profileService.updateProfile({
          phoneNumber: data.phoneNumber || null,
          currency: data.currency,
          dailyLimit: data.dailyLimit,
        });
        setProfile(updatedProfile);
        
        // Refresh user context to update currency across the app
        await fetchUser();
      }

      // Show success message only if no email change (email change shows its own message)
      if ((authChanged || profileChanged) && !emailChangedFlag) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      reset(data);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Resend email verification
  const handleResendVerification = async () => {
    try {
      await authService.resendEmailVerification();
      toast.success("Verification code has been resent to your email");
    } catch (error: any) {
      toast.error(error?.message || "Failed to resend verification code");
    }
  };

  // Confirm email change
  const handleConfirmEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.warning("Please enter a 6-digit verification code");
      return;
    }

    try {
      await authService.confirmEmailChange(verificationCode);
      setEmailVerificationOpen(false);
      setVerificationCode("");
      setPendingEmailVerification(false);
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Email verified successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh profile data
      const data = await profileService.getProfile();
      setProfile(data);
      reset({
        userName: data.userName,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        currency: data.currency as any,
        dailyLimit: data.dailyLimit,
      });
      await fetchUser();
    } catch (error: any) {
      toast.error(error?.message || "Failed to verify email");
    }
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
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
                  <h3 className="text-base font-semibold mb-4">Account Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2 text-sm">
                        Username
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input
                        id="username"
                        value={user?.cognitoUserName || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your login username cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userName">Display Name</Label>
                      <Input
                        id="userName"
                        placeholder="Enter your display name"
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
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
                          <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 flex-1">
                            Email verification pending
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-yellow-700 dark:text-yellow-300 underline hover:text-yellow-900 dark:hover:text-yellow-100"
                            onClick={() => setEmailVerificationOpen(true)}
                          >
                            Verify Now
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Changing your email will require verification
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
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
                  <h3 className="text-base font-semibold mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Preferred Currency</Label>
                      <Select
                        value={selectedCurrency}
                        onValueChange={(value) => setValue("currency", value as any, { shouldDirty: true })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
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
                      <Label htmlFor="dailyLimit">Daily Spending Limit</Label>
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
                        Set to 0 for no limit
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
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Verify Email Change</DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code sent to your new email address
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-center">
              <Mail className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
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
              Resend Verification Code
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
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEmail}
              disabled={verificationCode.length !== 6}
            >
              Verify Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
