import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { daysInCurrentMonth } from "./calculator-utils";

export type CalculatorTab = "basic" | "expense";

export interface CalculatorState {
  activeTab: CalculatorTab;
  expr: string;
  splitTotal: string;
  splitPeople: string;
  tipBill: string;
  tipPct: string;
  perDayAmount: string;
  perDayDays: string;
}

interface CalculatorStateContextValue extends CalculatorState {
  setActiveTab: (tab: CalculatorTab) => void;
  setExpr: (expr: string | ((prev: string) => string)) => void;
  setSplitTotal: (v: string) => void;
  setSplitPeople: (v: string) => void;
  setTipBill: (v: string) => void;
  setTipPct: (v: string) => void;
  setPerDayAmount: (v: string) => void;
  setPerDayDays: (v: string) => void;
}

const defaultState: CalculatorState = {
  activeTab: "basic",
  expr: "",
  splitTotal: "",
  splitPeople: "2",
  tipBill: "",
  tipPct: "10",
  perDayAmount: "",
  perDayDays: String(daysInCurrentMonth()),
};

const CalculatorStateContext = createContext<CalculatorStateContextValue | null>(
  null
);

export function CalculatorStateProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>(defaultState.activeTab);
  const [expr, setExpr] = useState(defaultState.expr);
  const [splitTotal, setSplitTotal] = useState(defaultState.splitTotal);
  const [splitPeople, setSplitPeople] = useState(defaultState.splitPeople);
  const [tipBill, setTipBill] = useState(defaultState.tipBill);
  const [tipPct, setTipPct] = useState(defaultState.tipPct);
  const [perDayAmount, setPerDayAmount] = useState(defaultState.perDayAmount);
  const [perDayDays, setPerDayDays] = useState(defaultState.perDayDays);

  const value = useMemo<CalculatorStateContextValue>(
    () => ({
      activeTab,
      expr,
      splitTotal,
      splitPeople,
      tipBill,
      tipPct,
      perDayAmount,
      perDayDays,
      setActiveTab,
      setExpr,
      setSplitTotal,
      setSplitPeople,
      setTipBill,
      setTipPct,
      setPerDayAmount,
      setPerDayDays,
    }),
    [
      activeTab,
      expr,
      splitTotal,
      splitPeople,
      tipBill,
      tipPct,
      perDayAmount,
      perDayDays,
    ]
  );

  return (
    <CalculatorStateContext.Provider value={value}>
      {children}
    </CalculatorStateContext.Provider>
  );
}

export function useCalculatorState(): CalculatorStateContextValue {
  const ctx = useContext(CalculatorStateContext);
  if (!ctx) {
    throw new Error("useCalculatorState must be used within CalculatorStateProvider");
  }
  return ctx;
}
