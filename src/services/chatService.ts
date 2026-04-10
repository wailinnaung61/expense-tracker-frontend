import { apiClient } from "@/lib/api";
import type { ChatResponse, ChatInitResponse } from "@/types/chat";

export const chatService = {
  async init(): Promise<ChatInitResponse> {
    return apiClient.get<ChatInitResponse>("/api/Chat/init");
  },

  async sendMessage(message: string): Promise<ChatResponse> {
    return apiClient.request<ChatResponse>("/api/Chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};
