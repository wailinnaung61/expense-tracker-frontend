import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalculatorPanel } from "./calculator-panel";

interface CalculatorPopoverProps {
  /** Element that opens the popover. */
  trigger: React.ReactNode;
  /** When provided, "Use result" buttons appear in the panel. */
  onApply?: (value: string) => void;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CalculatorPopover({
  trigger,
  onApply,
  open: controlledOpen,
  onOpenChange,
}: CalculatorPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-auto p-3"
      >
        <CalculatorPanel
          onApply={onApply}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
