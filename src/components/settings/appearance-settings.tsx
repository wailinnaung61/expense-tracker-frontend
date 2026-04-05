import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme/theme-provider";
import { Monitor, Moon, Palette, Sun, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load preferences from localStorage
    const savedAnimations = localStorage.getItem("appearance-animations");
    const savedCompactMode = localStorage.getItem("appearance-compact-mode");
    
    if (savedAnimations !== null) {
      const enableAnimations = savedAnimations === "true";
      setAnimations(enableAnimations);
      applyAnimationSetting(enableAnimations);
    }
    if (savedCompactMode !== null) {
      const enableCompact = savedCompactMode === "true";
      setCompactMode(enableCompact);
      applyCompactMode(enableCompact);
    }
  }, []);

  const applyAnimationSetting = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.remove("reduce-motion");
    } else {
      document.documentElement.classList.add("reduce-motion");
    }
  };

  const applyCompactMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("compact-mode");
    } else {
      document.documentElement.classList.remove("compact-mode");
    }
  };

  const handleAnimationsChange = (checked: boolean) => {
    setAnimations(checked);
    localStorage.setItem("appearance-animations", String(checked));
    applyAnimationSetting(checked);
  };

  const handleCompactModeChange = (checked: boolean) => {
    setCompactMode(checked);
    localStorage.setItem("appearance-compact-mode", String(checked));
    applyCompactMode(checked);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            {t("settings.appearance.themeTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.appearance.themeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Label htmlFor="theme">{t("settings.appearance.colorScheme")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.appearance.colorSchemeHint")}
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t("settings.appearance.light")}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t("settings.appearance.dark")}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t("settings.appearance.system")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t("settings.appearance.displayTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.appearance.displayDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Label htmlFor="animations">{t("settings.appearance.animations")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.appearance.animationsHint")}
              </p>
            </div>
            <Switch
              id="animations"
              checked={animations}
              onCheckedChange={handleAnimationsChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Label htmlFor="compact">{t("settings.appearance.compactMode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.appearance.compactModeHint")}
              </p>
            </div>
            <Switch
              id="compact"
              checked={compactMode}
              onCheckedChange={handleCompactModeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
