import { useTranslation } from "@/hooks/useTranslation";

export function SettingsHeader() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-wide">{t("settings.title")}</h1>
      <p className="text-sm text-muted-foreground tracking-wide">
        {t("settings.description")}
      </p>
    </div>
  );
}
