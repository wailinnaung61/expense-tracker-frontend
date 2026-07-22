import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { EmailSentSettings } from "@/components/settings/email-sent-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const TAB_VALUES = [
  "profile",
  "appearance",
  "notifications",
  "email",
  "security",
] as const;

type SettingsTab = (typeof TAB_VALUES)[number];

function parseTab(value: string | null): SettingsTab {
  if (value && (TAB_VALUES as readonly string[]).includes(value)) {
    return value as SettingsTab;
  }
  return "profile";
}

export function SettingsTabs() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>(() =>
    parseTab(searchParams.get("tab"))
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const next = parseTab(value);
    setTab(next);
    setSearchParams(next === "profile" ? {} : { tab: next }, { replace: true });
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
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
            value="email"
            className="h-10 bg-muted rounded-none me-px"
          >
            {t("settings.tabs.email")}
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
      <TabsContent value="email">
        <EmailSentSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  );
}
