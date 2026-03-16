import { useThemeContext } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useState } from "react";

type ThemeValue = "light" | "dark";
type LayoutValue = "vertical" | "horizontal";
type DirectionValue = "ltr" | "rtl";
type PrimaryColor = "teal" | "pink" | "blue" | "purple" | "red" | "orange" | "cyan" | "rose" | "indigo" | "amber";

const COLOR_OPTIONS: { key: PrimaryColor; bg: string }[] = [
  { key: "teal",   bg: "#11B989" },
  { key: "pink",   bg: "#ec4899" },
  { key: "blue",   bg: "#155dfc" },
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
  const { layout, setLayout, direction, setDirection, primaryColor, setPrimaryColor, config } = useThemeContext();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (value: ThemeValue) => setTheme(value);
  const handleLayoutChange = (value: LayoutValue) => setLayout(value);
  const handleDirectionChange = (value: DirectionValue) => setDirection(value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-90 p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Appearance</DialogTitle>
          <DialogDescription>
            Customize the theme, layout, and appearance settings.
          </DialogDescription>
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
                  onClick={() => setPrimaryColor(key)}
                  style={{ backgroundColor: bg }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative",
                    primaryColor === key
                      ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/30 shadow-lg"
                      : "border-muted-foreground/20 hover:border-foreground/40"
                  )}
                  aria-label={`${key} theme color`}
                >
                  {primaryColor === key && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white shadow-md" />
                    </span>
                  )}
                </button>
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