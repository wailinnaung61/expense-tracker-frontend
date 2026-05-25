import { useState } from "react";
import { Calculator, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CalculatorPopover } from "./calculator-popover";
import { useThemeContext } from "@/components/theme/theme-provider";

export function CalculatorFab() {
  const { t } = useTranslation();
  const { direction } = useThemeContext();
  const [open, setOpen] = useState(false);

  const isRtl = direction === "rtl";

  // Stacked above the ChatBot FAB (which sits at bottom-4 right-7 / left-7 in RTL)
  // The chat FAB is ~56px tall + 16px gap = 72px → bottom-[5.5rem] ≈ 88px gives 16px breathing room
  const positionClass = isRtl
    ? "fixed bottom-[5.5rem] left-7 z-50 sm:left-9 md:left-10"
    : "fixed bottom-[5.5rem] right-7 z-50 sm:right-9 md:right-10";

  return (
    <CalculatorPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          aria-label={open ? t("calculator.close") : t("calculator.open")}
          className={[
            positionClass,
            "group overflow-hidden rounded-full transition-all duration-300 hover:scale-105 active:scale-95",
            "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
            open
              ? "h-9 w-9 shadow-md opacity-70 hover:opacity-100"
              : "h-12 w-12 sm:h-14 sm:w-14 shadow-[0_14px_34px_-8px_rgba(139,92,246,0.75)]",
          ].join(" ")}
        >
          {/* Hover shimmer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {!open && (
            <div className="absolute inset-0 rounded-full animate-ping bg-violet-200 opacity-25" />
          )}
          <div className="relative flex items-center justify-center h-full transition-transform duration-300">
            {open ? (
              <X className="h-4 w-4 text-white group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Calculator className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            )}
          </div>
        </button>
      }
    />
  );
}
