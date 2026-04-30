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

  async deleteThread(id: string): Promise<void> {
    await api.delete(apiRoutes.messages.thread(id));
  },

  async send(threadId: string, body: string): Promise<ChatMessage> {
    const { data } = await api.post<ApiResponse<ChatMessage>>(
      apiRoutes.messages.send(threadId),
      { body },
    );
    return data?.data;
  },

  /** Sends a DM to `targetUserId`, reusing any existing 1-on-1 thread or
   *  creating one if none exists. The server-resolved threadId comes back in
   *  the response — never trust the locally generated UUID, which is only a
   *  hint for first-message thread creation.
   *  Pass `postId` for inquiry-about-a-post DMs (drives lead creation). */
  async startDirectMessage(
    targetUserId: string,
    body: string,
    postId?: string,
  ): Promise<{ threadId: string; message: ChatMessage }> {
    const provisionalId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}`;
    const { data } = await api.post<ApiResponse<ChatMessage>>(
      apiRoutes.messages.send(provisionalId),
      { body, targetUserId, postId },
    );
    if (!data?.data) {
      throw new Error("No message returned");
    }
    return { threadId: data.data.threadId, message: data.data };
  },
};
