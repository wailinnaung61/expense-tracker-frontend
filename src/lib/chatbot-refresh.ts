export const CHATBOT_REFRESH_EVENT = "chatbot:refresh-target";

export type ChatRefreshTarget =
  | "transactions"
  | "summary"
  | "categories"
  | "recurring_payments"
  | "budget"
  | "investments"
  | "savings";

export interface ChatbotRefreshEventDetail {
  target: ChatRefreshTarget;
}

export const isChatRefreshTarget = (value: unknown): value is ChatRefreshTarget => {
  return (
    value === "transactions" ||
    value === "summary" ||
    value === "categories" ||
    
    value === "recurring_payments" ||
    value === "budget" ||
    value === "investments" ||
    value === "savings"
  );
};

export const dispatchChatRefreshTarget = (target: ChatRefreshTarget) => {
  window.dispatchEvent(
    new CustomEvent<ChatbotRefreshEventDetail>(CHATBOT_REFRESH_EVENT, {
      detail: { target },
    })
  );
};

const FUNCTION_REFRESH_MAP: Record<string, ChatRefreshTarget> = {
  add_expense: "transactions",
  add_income: "transactions",
  add_investment: "transactions",
  add_savings: "transactions",
  update_transaction: "transactions",
  delete_transaction: "transactions",
  list_transactions: "transactions",
  find_transaction: "transactions",

  get_monthly_summary: "summary",
  get_yearly_summary: "summary",
  get_expense_breakdown: "summary",
  get_dashboard: "summary",
  get_custom_date_range: "summary",
  get_dashboard_range: "summary",
  get_saving_dashboard: "summary",

  list_categories: "categories",
  create_category: "categories",
  update_category: "categories",
  delete_category: "categories",

  get_budget: "budget",
  get_budget_range: "budget",
  get_budget_containing: "budget",
  create_budget: "budget",
  update_budget: "budget",
  delete_budget: "budget",
  add_budget_category: "budget",
  remove_budget_category: "budget",

  list_recurring_payments: "recurring_payments",
  create_recurring_payment: "recurring_payments",
  update_recurring_payment: "recurring_payments",
  delete_recurring_payment: "recurring_payments",
  mark_recurring_paid: "recurring_payments",
  acknowledge_recurring_paid: "recurring_payments",

  list_saving_goals: "savings",
  create_saving_goal: "savings",
  update_saving_goal: "savings",
  delete_saving_goal: "savings",
  add_saving_contribution: "savings",

  list_investments: "investments",
  create_investment_record: "investments",
  create_portfolio: "investments",
  update_investment: "investments",
  delete_investment: "investments",
  get_investment_dashboard: "investments",
};

export const resolveRefreshTargetsFromFunctions = (
  functionsCalled: string[] | null | undefined
): ChatRefreshTarget[] => {
  if (!functionsCalled?.length) return [];
  const targets = new Set<ChatRefreshTarget>();
  for (const fn of functionsCalled) {
    const target = FUNCTION_REFRESH_MAP[fn];
    if (target) targets.add(target);
  }
  return [...targets];
};
