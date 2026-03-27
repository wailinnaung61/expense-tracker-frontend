import { apiClient } from "@/lib/api";
import type { ChatResponse } from "@/types/chat";

export const chatService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    return apiClient.request<ChatResponse>("/api/Chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};
