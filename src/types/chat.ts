import type { ChatRefreshTarget } from "@/lib/chatbot-refresh";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  createdAt: string;
  refreshTarget?: ChatRefreshTarget | null;
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
