import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse, Paginated } from "@/types";

export type MessageThread = {
  id: string;
  participants: { id: string; name: string; avatarUrl?: string }[];
  lastMessageAt: string;
  unreadCount: number;
  preview: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export const messageService = {
  async listThreads(): Promise<Paginated<MessageThread>> {
    const { data } = await api.get<ApiResponse<Paginated<MessageThread>>>(
      apiRoutes.messages.threads,
    );
    return data?.data ?? { items: [], nextCursor: null, total: 0 };
  },

  async getThread(id: string): Promise<Paginated<ChatMessage>> {
    const { data } = await api.get<ApiResponse<Paginated<ChatMessage>>>(
      apiRoutes.messages.thread(id),
    );
    return data?.data ?? { items: [], nextCursor: null, total: 0 };
  },

  async send(threadId: string, body: string): Promise<ChatMessage> {
    const { data } = await api.post<ApiResponse<ChatMessage>>(
      apiRoutes.messages.send(threadId),
      { body },
    );
    return data?.data;
  },

  /** Creates a new thread (any fresh threadId) and sends the first message. */
  async startDirectMessage(
    targetUserId: string,
    body: string,
  ): Promise<{ threadId: string; message: ChatMessage }> {
    const threadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}`;
    const { data } = await api.post<ApiResponse<ChatMessage>>(
      apiRoutes.messages.send(threadId),
      { body, targetUserId },
    );
    if (!data?.data) {
      throw new Error("No message returned");
    }
    return { threadId, message: data.data };
  },
};
