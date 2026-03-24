import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AppSettings() {
  return (
    <div className="space-y-6">
  {/* Appearance Settings */}
  <Card className="w-full">
    <CardHeader className="pb-4 border-b">
      <CardTitle>Appearance</CardTitle>
      <CardDescription>
        Customize how the app looks and feels
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select your preferred theme
          </p>
        </div>
        <Select defaultValue="system">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Label htmlFor="animations">Animations</Label>
          <p className="text-sm text-muted-foreground">
            Enable or disable animations
          </p>
        </div>
        <Switch id="animations" defaultChecked />
      </div>
    </CardContent>
  </Card>

  {/* Notifications Settings */}
  <Card className="w-full">
    <CardHeader className="pb-4 border-b">
      <CardTitle>Notifications</CardTitle>
      <CardDescription>
        Configure your notification preferences
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 pt-4">
      {[
        {
          id: "emailNotifications",
          label: "Email Notifications",
          description: "Receive notifications via email",
        },
        {
          id: "pushNotifications",
          label: "Push Notifications",
          description: "Receive notifications on your device",
        },
        {
          id: "budgetAlerts",
          label: "Budget Alerts",
          description: "Get notified when you're close to budget limits",
        },
        {
          id: "savingsReminders",
          label: "Savings Reminders",
          description: "Receive reminders to contribute to savings goals",
        },
      ].map(({ id, label, description }) => (
        <div
          key={id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <Label htmlFor={id}>{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch id={id} defaultChecked />
        </div>
      ))}
    </CardContent>
  </Card>

  {/* Data & Privacy Settings */}
  <Card className="w-full">
    <CardHeader className="pb-4 border-b">
      <CardTitle>Data & Privacy</CardTitle>
      <CardDescription>
        Manage your data and privacy settings
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 pt-4">
      {[
        {
          id: "dataSharing",
          label: "Data Sharing",
          description:
            "Share anonymous usage data to improve the app",
          checked: true,
        },
        {
          id: "marketingEmails",
          label: "Marketing Emails",
          description:
            "Receive marketing and promotional emails",
          checked: false,
        },
      ].map(({ id, label, description, checked }) => (
        <div
          key={id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <Label htmlFor={id}>{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch id={id} defaultChecked={checked} />
        </div>
      ))}

      <div className="pt-4">
        <Button
          variant="outline"
          className="bg-muted hover:bg-primary hover:text-primary-foreground"
        >
          Export My Data
        </Button>
      </div>
    </CardContent>
  </Card>
</div>

  );
}
