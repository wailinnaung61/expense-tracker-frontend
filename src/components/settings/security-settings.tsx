import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { MfaSetupDialog } from "./mfa-setup-dialog";
import { authService } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
    CheckCircle2,
    Globe,
    Laptop,
    Lock,
    Loader2,
    MoreHorizontal,
    PhoneIcon,
    Shield,
    Smartphone,
    Tablet,
} from "lucide-react";

export function SecuritySettings() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loadingMfaStatus, setLoadingMfaStatus] = useState(true);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
        
        // Show success with SweetAlert
        Swal.fire({
          icon: "success",
          title: t("settings.security.mfaDisabled"),
          text: t("settings.security.mfaDisabledMessage"),
          confirmButtonText: t("common.confirm"),
          timer: 3000,
          timerProgressBar: true,
        });
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

  const devices = [
    {
      id: 1,
      name: "MacBook Pro",
      type: "laptop",
      lastActive: "Active now",
      location: "New York, USA",
      browser: "Chrome 114.0.5735.198",
      os: "macOS 12.4",
      current: true,
    },
    {
      id: 2,
      name: "iPhone 13",
      type: "mobile",
      lastActive: "Last active 2 hours ago",
      location: "New York, USA",
      browser: "Safari 15.4",
      os: "iOS 16.2",
      current: false,
    },
  ];

  const loginHistory = [
    {
      id: 1,
      device: "MacBook Pro",
      type: "laptop",
      location: "New York, USA",
      ip: "192.168.1.1",
      date: "May 22, 2024 10:30 AM",
      status: "success",
      current: true,
    },
    {
      id: 2,
      device: "iPhone 13",
      type: "mobile",
      location: "New York, USA",
      ip: "192.168.1.2",
      date: "May 21, 2024 8:15 PM",
      status: "success",
      current: false,
    },
  ];

  const getDeviceIcon = (type: string): React.ReactElement => {
    switch (type) {
      case "laptop":
        return <Laptop className="h-4 w-4" />;
      case "mobile":
        return <PhoneIcon className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const handleRemoveDevice = (_id: string | number) => {
    // TODO: Implement device removal
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordChangeOpen(false);
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

        {/* Device Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Device Management
            </CardTitle>
            <CardDescription>See where you&apos;re signed in</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices" className="space-y-4">
              <TabsList className="flex bg-muteed border p-px h-11 border-border rounded-md text-foreground w-fit">
                <TabsTrigger
                  value="devices"
                  className="h-10 bg-muted rounded-r-none me-px"
                >
                  Devices
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="h-10 rounded-l-none bg-muted"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="devices" className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border p-4 rounded hover:bg-accent transition"
                  >
                    {/* Left content */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ${
                          device.current ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {device.name}
                          </span>
                          {device.current && (
                            <Badge variant="outline">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {device.lastActive}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {device.browser} • {device.os}
                        </div>
                      </div>
                    </div>

                    {/* Right menu */}
                    {!device.current && (
                      <div className="self-end sm:self-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Device Info</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleRemoveDevice(device.id)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {loginHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border p-3 rounded-md"
                  >
                    {/* Device + badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getDeviceIcon(entry.type)}
                      <span className="font-medium">{entry.device}</span>
                      {entry.current && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/10"
                        >
                          Current
                        </Badge>
                      )}
                    </div>

                    {/* Info blocks */}
                    <div className="text-sm text-muted-foreground">
                      {entry.location} • {entry.ip}
                    </div>
                    <div className="text-sm">{entry.date}</div>

                    {/* Status */}
                    <div className="text-right">
                      {entry.status === "success" ? (
                        <Badge className="bg-green-200 text-green-900">
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Additional Security
            </CardTitle>
            <CardDescription>Configure extra protections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between hover:bg-accent py-2 px-3 hover:rounded-sm">
              <div>
                <Label htmlFor="loginAlerts">Login Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications of new logins
                </p>
              </div>
              <Switch id="loginAlerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between hover:bg-accent py-2 px-3 hover:rounded-sm">
              <div>
                <Label htmlFor="suspiciousActivity">Suspicious Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Alert on unusual login attempts
                </p>
              </div>
              <Switch id="suspiciousActivity" defaultChecked />
            </div>

            <div className="flex items-center justify-between hover:bg-accent py-2 px-3 hover:rounded-sm">
              <div>
                <Label htmlFor="passwordReset">Reset Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require verification to reset password
                </p>
              </div>
              <Switch id="passwordReset" defaultChecked />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPasswordChangeOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and set a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordChangeOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
