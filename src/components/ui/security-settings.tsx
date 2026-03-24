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
import { useState } from "react";

import {
    CheckCircle2,
    Copy,
    Globe,
    Laptop,
    Lock,
    MoreHorizontal,
    PhoneIcon,
    Shield,
    Smartphone,
    Tablet,
} from "lucide-react";

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [backupCodes, _setBackupCodes] = useState([
    "ABCD-EFGH-IJKL",
    "MNOP-QRST-UVWX",
    "1234-5678-9012",
    "3456-7890-1234",
    "5678-9012-3456",
    "7890-1234-5678",
    "9012-3456-7890",
    "2345-6789-0123",
  ]);

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

  const handleVerifyCode = () => {
    if (verificationCode === "123456") {
      setTwoFactorEnabled(true);
      setShowQRCode(false);
    }
  };

  const handleRemoveDevice = (_id: string | number) => {

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
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="2fa">Enable 2FA</Label>
                <p className="text-xs text-muted-foreground">
                  Send a code to your phone or email when logging in.
                </p>
              </div>
              <Switch
                id="2fa"
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShowQRCode(true);
                  } else {
                    setTwoFactorEnabled(false);
                  }
                }}
              />
            </div>

            {showQRCode && !twoFactorEnabled && (
              <div className="rounded-md border p-4 space-y-4">
                <div className="text-center">
                  <p className="mb-2 font-medium">Scan this QR code</p>
                  <img
                    src="/placeholder.svg"
                    width={180}
                    height={180}
                    alt="QR Code"
                    className="mx-auto"
                  />
                  <p className="text-sm mt-2 text-muted-foreground">
                    Or enter code manually:{" "}
                    <code className="font-mono">ABCD EFGH</code>
                  </p>
                </div>
                <div>
                  <Label>Verification Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                    />
                    <Button onClick={handleVerifyCode}>Verify</Button>
                  </div>
                </div>
              </div>
            )}

            {twoFactorEnabled && (
              <>
                <Alert className="bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>
                    Two-factor authentication is enabled.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Backup Codes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted rounded px-2 py-1 text-sm font-mono"
                      >
                        {code}
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline">Download</Button>
                    <Button variant="outline">Generate New</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

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
              <TabsList className="flex bg-muteed border p-[1px] h-11 border-border rounded-md text-foreground w-fit">
                <TabsTrigger
                  value="devices"
                  className="h-10 bg-muted rounded-r-none me-[1px]"
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
        <DialogContent className="sm:max-w-[425px]">
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
