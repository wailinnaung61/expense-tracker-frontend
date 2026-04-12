import type { ChatRefreshTarget } from "@/lib/chatbot-refresh";

/** Mirrors server `AppConstants.ChatClientActionType.ShowReportsDownload`. */
export const CHAT_CLIENT_ACTION_SHOW_REPORTS_DOWNLOAD = "show_reports_download" as const;

export interface ChatClientAction {
  type: string;
  startMonth?: string | null;
  endMonth?: string | null;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  createdAt: string;
  refreshTarget?: ChatRefreshTarget | null;
  functionsCalled?: string[] | null;
  functionResult?: any;
  clientAction?: ChatClientAction | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  translationKey?: string;
  clientAction?: ChatClientAction | null;
}

export interface ChatCategoryInfo {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export interface ChatNotificationInfo {
  title: string;
  message: string;
  createdAt: string;
}

export interface ChatBudgetInfo {
  total: number;
  spent: number;
  remaining: number;
  usagePercent: number;
}

export interface ChatSavingsInfo {
  totalSaved: number;
  activeGoals: number;
}

export interface ChatInitResponse {
  userName: string;
  currency: string;
  categories: ChatCategoryInfo[];
  recentNotifications: ChatNotificationInfo[];
  budget: ChatBudgetInfo | null;
  savings: ChatSavingsInfo | null;
}
