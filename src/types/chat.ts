export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  createdAt: string;
  refreshTarget?: "transactions" | "summary" | "categories" | "recurring_payments" | null;
  functionsCalled?: string[] | null;
  functionResult?: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  translationKey?: string;
}
