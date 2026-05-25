import { useState } from "react";
import { Delete } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  daysInCurrentMonth,
  formatApplyValue,
  formatResult,
  parseExpression,
} from "./calculator-utils";

interface CalculatorPanelProps {
  /** When provided a "Use result" button appears on the expense tab and basic tab. */
  onApply?: (value: string) => void;
  /** Called when the panel wants to close itself (e.g. after applying a result). */
  onClose?: () => void;
}

// ── Basic keypad ──────────────────────────────────────────────────────────────

type KeyDef = { label: string | React.ReactNode; value: string; wide?: boolean; action?: "clear" | "backspace" | "equals" };

const KEYS: KeyDef[] = [
  { label: "C",  value: "C",  action: "clear" },
  { label: <Delete className="h-4 w-4 mx-auto" />, value: "⌫", action: "backspace" },
  { label: "÷",  value: "÷" },
  { label: "×",  value: "×" },
  { label: "7",  value: "7" },
  { label: "8",  value: "8" },
  { label: "9",  value: "9" },
  { label: "−",  value: "−" },
  { label: "4",  value: "4" },
  { label: "5",  value: "5" },
  { label: "6",  value: "6" },
  { label: "+",  value: "+" },
  { label: "1",  value: "1" },
  { label: "2",  value: "2" },
  { label: "3",  value: "3" },
  { label: "=",  value: "=", action: "equals" },
  { label: "0",  value: "0", wide: true },
  { label: ".",  value: "." },
];

function BasicTab({ onApply, onClose }: CalculatorPanelProps) {
  const { t } = useTranslation();
  const [expr, setExpr] = useState("");
  const [error, setError] = useState(false);

  const normalise = (s: string) =>
    s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  const currentResult = (): number | null => parseExpression(normalise(expr));

  const handleKey = (key: KeyDef) => {
    setError(false);
    if (key.action === "clear") {
      setExpr("");
      return;
    }
    if (key.action === "backspace") {
      setExpr((p) => p.slice(0, -1));
      return;
    }
    if (key.action === "equals") {
      const result = currentResult();
      if (result === null) {
        setError(true);
      } else {
        setExpr(formatResult(result));
      }
      return;
    }
    setExpr((p) => p + key.value);
  };

  const result = currentResult();
  const displayResult =
    result !== null && expr !== "" && expr !== formatResult(result)
      ? formatResult(result)
      : null;

  const handleApply = () => {
    const r = currentResult();
    if (r === null) { setError(true); return; }
    onApply?.(formatApplyValue(r));
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Display */}
      <div className="rounded-md border bg-muted/40 px-3 py-2 min-h-[3.5rem] flex flex-col justify-end items-end">
        <span className="text-base font-mono break-all text-right leading-tight">
          {expr || "0"}
        </span>
        {displayResult !== null && (
          <span className="text-xs text-muted-foreground font-mono">= {displayResult}</span>
        )}
        {error && (
          <span className="text-xs text-destructive">{t("calculator.invalidExpression")}</span>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            className={[
              "rounded-md border border-border bg-background text-sm font-medium h-10 transition-colors",
              "hover:bg-accent hover:text-accent-foreground active:scale-95",
              key.wide ? "col-span-2" : "",
              key.action === "equals"
                ? "bg-primary text-primary-foreground hover:bg-primary/90 row-span-2 h-auto"
                : "",
              key.action === "clear" || key.action === "backspace"
                ? "text-muted-foreground"
                : "",
            ].join(" ")}
          >
            {key.label}
          </button>
        ))}
      </div>

      {onApply && (
        <Button size="sm" className="mt-1 w-full" onClick={handleApply}>
          {t("calculator.useResult")}
        </Button>
      )}
    </div>
  );
}

// ── Expense shortcuts ─────────────────────────────────────────────────────────

function ExpenseTab({ onApply, onClose }: CalculatorPanelProps) {
  const { t } = useTranslation();

  const [splitTotal, setSplitTotal] = useState("");
  const [splitPeople, setSplitPeople] = useState("2");

  const [tipBill, setTipBill] = useState("");
  const [tipPct, setTipPct] = useState("10");

  const [perDayAmount, setPerDayAmount] = useState("");
  const [perDayDays, setPerDayDays] = useState(String(daysInCurrentMonth()));

  const apply = (n: number) => {
    onApply?.(formatApplyValue(n));
    onClose?.();
  };

  const splitResult =
    parseFloat(splitTotal) > 0 && parseInt(splitPeople) >= 1
      ? parseFloat(splitTotal) / parseInt(splitPeople)
      : null;

  const tipResult =
    parseFloat(tipBill) > 0 && parseFloat(tipPct) >= 0
      ? parseFloat(tipBill) * (1 + parseFloat(tipPct) / 100)
      : null;

  const perDayResult =
    parseFloat(perDayAmount) > 0 && parseInt(perDayDays) >= 1
      ? parseFloat(perDayAmount) / parseInt(perDayDays)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Split bill */}
      <div className="rounded-md border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("calculator.splitBill.title")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{t("calculator.splitBill.total")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={splitTotal}
              onChange={(e) => setSplitTotal(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">{t("calculator.splitBill.people")}</Label>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="2"
              value={splitPeople}
              onChange={(e) => setSplitPeople(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        {splitResult !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">{formatApplyValue(splitResult)}</span>
            {onApply && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => apply(splitResult)}>
                {t("calculator.useResult")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-md border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("calculator.tip.title")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{t("calculator.tip.bill")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={tipBill}
              onChange={(e) => setTipBill(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">{t("calculator.tip.percent")}</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="10"
              value={tipPct}
              onChange={(e) => setTipPct(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        {tipResult !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">{formatApplyValue(tipResult)}</span>
            {onApply && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => apply(tipResult)}>
                {t("calculator.useResult")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Per day */}
      <div className="rounded-md border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("calculator.perDay.title")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{t("calculator.perDay.amount")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={perDayAmount}
              onChange={(e) => setPerDayAmount(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">{t("calculator.perDay.days")}</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={perDayDays}
              onChange={(e) => setPerDayDays(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        {perDayResult !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">{formatApplyValue(perDayResult)}</span>
            {onApply && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => apply(perDayResult)}>
                {t("calculator.useResult")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function CalculatorPanel({ onApply, onClose }: CalculatorPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="w-72">
      <Tabs defaultValue="basic">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1 text-xs">
            {t("calculator.basicTab")}
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex-1 text-xs">
            {t("calculator.expenseTab")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicTab onApply={onApply} onClose={onClose} />
        </TabsContent>
        <TabsContent value="expense" className="max-h-[420px] overflow-y-auto pr-0.5">
          <ExpenseTab onApply={onApply} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
