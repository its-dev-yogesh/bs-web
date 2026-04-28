import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse, Paginated } from "@/types";

export type Notification = {
  id: string;
  type: "connection_request" | "post_like" | "comment" | "mention" | "message";
  actor: { id: string; name: string; avatarUrl?: string };
  read: boolean;
  link?: string;
  createdAt: string;
};

export const notificationService = {
  async list(): Promise<Paginated<Notification>> {
    const { data } = await api.get<ApiResponse<Paginated<Notification>>>(
      apiRoutes.notifications.list,
    );
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<{ count: number }>>(
      apiRoutes.notifications.unreadCount,
    );
    return data.data.count;
  },

  async markRead(id: string): Promise<void> {
    await api.post(apiRoutes.notifications.markRead(id));
  },
};
