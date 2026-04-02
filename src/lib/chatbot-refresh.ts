export const CHATBOT_REFRESH_EVENT = "chatbot:refresh-target";

export type ChatRefreshTarget =
  | "transactions"
  | "summary"
  | "categories"
  | "recurring_payments"
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

export const resolveRefreshTargetFromFunctions = (
  functionsCalled: string[] | null | undefined
): ChatRefreshTarget | null => {
  const functionName = functionsCalled?.[0];

  switch (functionName) {
    case "add_expense":
    case "add_income":
    case "list_transactions":
    case "delete_transaction":
      return "transactions";
    case "get_monthly_summary":
    case "get_yearly_summary":
    case "get_expense_breakdown":
      return "summary";
    case "list_categories":
      return "categories";
    case "list_recurring_payments":
      return "recurring_payments";
    default:
      return null;
  }
};
