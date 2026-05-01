import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type Notification = {
  id: string;
  type:
    | "connection_request"
    | "follow"
    | "post_like"
    | "comment"
    | "mention"
    | "message"
    | "requirement_match";
  actor: { id: string; name: string; username?: string; avatarUrl?: string };
  read: boolean;
  link?: string;
  createdAt: string;
};

export const notificationService = {
  async list(): Promise<Notification[]> {
    try {
      const { data } = await api.get<Notification[]>(
        apiRoutes.notifications.list,
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number }>(
        apiRoutes.notifications.unreadCount,
      );
      return data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  async markRead(id: string): Promise<void> {
    await api.post(apiRoutes.notifications.markRead(id));
  },

  async markAllRead(): Promise<void> {
    await api.post(apiRoutes.notifications.markAllRead);
  },
};
