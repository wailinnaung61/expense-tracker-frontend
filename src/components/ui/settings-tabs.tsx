import { AppSettings } from "@/components/settings/app-settings";
import { HelpSupport } from "@/components/settings/help-support";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { Resources } from "@/components/settings/resources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "./security-settings";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <div className="overflow-x-auto whitespace-nowrap pb-2">
        <TabsList className="flex bg-muteed border p-[1px] h-11 border-border rounded-md text-foreground w-fit">
          <TabsTrigger
            value="profile"
            className="h-10 bg-muted rounded-r-none me-[1px]"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="app"
            className="h-10 rounded-none me-[1px] bg-muted"
          >
            App
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-10 rounded-none me-[1px] bg-muted"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="h-10 rounded-none me-[1px] bg-muted"
          >
            Help
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="h-10 rounded-l-none bg-muted"
          >
            Resources
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="app">
        <AppSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="help">
        <HelpSupport />
      </TabsContent>
      <TabsContent value="resources">
        <Resources />
      </TabsContent>
    </Tabs>
  );
}
