import { useThemeContext } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  PanelLeft,
  PanelTop,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeValue = "light" | "dark" | "system";
type LayoutValue = "vertical" | "horizontal";
type DirectionValue = "ltr" | "rtl";
type PrimaryColor = "teal" | "pink" | "blue" | "purple" | "red" | "orange" | "cyan" | "rose" | "indigo" | "amber";

const COLOR_OPTIONS: { key: PrimaryColor; bg: string }[] = [
  { key: "teal",   bg: "#11B989" },
  { key: "pink",   bg: "#ec4899" },
  { key: "blue",   bg: "#3b82f6" },
  { key: "purple", bg: "#a855f7" },
  { key: "red",    bg: "#ef4444" },
  { key: "orange", bg: "#f97316" },
  { key: "cyan",   bg: "#06b6d4" },
  { key: "rose",   bg: "#f43f5e" },
  { key: "indigo", bg: "#6366f1" },
  { key: "amber",  bg: "#f59e0b" },
];

export function ThemeConfig() {
  const { theme, setTheme } = useTheme();
  const { layout, setLayout, direction, setDirection, config } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(
    (config.colors?.defaultPrimaryColor as PrimaryColor) || "teal"
  );

  const handleThemeChange = (value: ThemeValue) => setTheme(value);
  const handleLayoutChange = (value: LayoutValue) => setLayout(value);
  const handleDirectionChange = (value: DirectionValue) => setDirection(value);

  const setColorClass = (color: PrimaryColor) => {
    const root = document.documentElement;
    root.classList.remove(...COLOR_OPTIONS.map((c) => `theme-${c.key}`));
    root.classList.add(`theme-${color}`);
  };

  const handleColorChange = (color: PrimaryColor) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty("--primary", `var(--${color})`);
    document.documentElement.style.setProperty("--primary-foreground", `var(--${color}-foreground)`);
    setColorClass(color);
  };

  useEffect(() => {
    const savedColor =
      (localStorage.getItem("primaryColor") as PrimaryColor) ||
      (config.colors?.defaultPrimaryColor as PrimaryColor) ||
      "teal";
    setPrimaryColor(savedColor);
    handleColorChange(savedColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.colors?.defaultPrimaryColor]);

  useEffect(() => {
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor]);

  const activeBg = COLOR_OPTIONS.find((c) => c.key === primaryColor)?.bg ?? "#11B989";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
          <span
            className="absolute -top-0.5 -inset-e-0.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: activeBg }}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-90 p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Appearance</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme</Label>
            <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex gap-2">
              <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", theme === "light" && "border-primary bg-background")}>
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-4 w-4" /> Light
              </Label>
              <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", theme === "dark" && "border-primary bg-background")}>
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-4 w-4" /> Dark
              </Label>
            </RadioGroup>
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primary Color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map(({ key, bg }) => (
                <button
                  key={key}
                  onClick={() => handleColorChange(key)}
                  style={{ backgroundColor: bg }}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    primaryColor === key
                      ? "border-white scale-110 ring-2 ring-offset-1 ring-white/40"
                      : "border-transparent"
                  )}
                  aria-label={`${key} theme color`}
                />
              ))}
            </div>
          </div>

          {/* Layout */}
          {config.availableLayouts.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Layout</Label>
              <RadioGroup value={layout} onValueChange={handleLayoutChange} className="flex gap-2">
                <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", layout === "vertical" && "border-primary bg-background")}>
                  <RadioGroupItem value="vertical" id="vertical" className="sr-only" />
                  <PanelLeft className="h-4 w-4" /> Sidebar
                </Label>
                <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", layout === "horizontal" && "border-primary bg-background")}>
                  <RadioGroupItem value="horizontal" id="horizontal" className="sr-only" />
                  <PanelTop className="h-4 w-4" /> Horizontal
                </Label>
              </RadioGroup>
            </div>
          )}

          {/* Direction */}
          {config.availableDirections.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Direction</Label>
              <RadioGroup value={direction} onValueChange={handleDirectionChange} className="flex gap-2">
                <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", direction === "ltr" && "border-primary bg-background")}>
                  <RadioGroupItem value="ltr" id="ltr" className="sr-only" />
                  <ArrowRight className="h-4 w-4" /> LTR
                </Label>
                <Label className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer border text-sm", direction === "rtl" && "border-primary bg-background")}>
                  <RadioGroupItem value="rtl" id="rtl" className="sr-only" />
                  <ArrowLeft className="h-4 w-4" /> RTL
                </Label>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}