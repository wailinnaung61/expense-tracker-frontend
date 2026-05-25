import { Calculator } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { CalculatorPopover } from "./calculator-popover";

interface AmountFieldCalculatorTriggerProps {
  onApply: (value: string) => void;
  className?: string;
}

export function AmountFieldCalculatorTrigger({
  onApply,
  className,
}: AmountFieldCalculatorTriggerProps) {
  const { t } = useTranslation();

  return (
    <CalculatorPopover
      onApply={onApply}
      trigger={
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={className}
          aria-label={t("calculator.open")}
        >
          <Calculator className="h-4 w-4" />
        </Button>
      }
    />
  );
}
