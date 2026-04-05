import { ProfileSettings } from "@/components/settings/profile-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "./security-settings";
import { useTranslation } from "@/hooks/useTranslation";

export function SettingsTabs() {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <div className="overflow-x-auto whitespace-nowrap pb-2">
        <TabsList className="flex bg-muteed border p-px h-11 border-border rounded-md text-foreground w-fit">
          <TabsTrigger
            value="profile"
            className="h-10 bg-muted rounded-none me-px"
          >
            {t("settings.tabs.profile")}
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="h-10 bg-muted rounded-none me-px"
          >
            {t("settings.tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="h-10 bg-muted rounded-none me-px"
          >
            {t("settings.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-10 bg-muted rounded-none"
          >
            {t("settings.tabs.security")}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  );
}
