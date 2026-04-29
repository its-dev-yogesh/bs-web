import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import { ApiError } from "@/lib/api-error";
import type { ApiResponse, Paginated, PublicProfile } from "@/types";

export const connectionService = {
  async list(): Promise<Paginated<PublicProfile>> {
    const { data: body } = await api.get<
      ApiResponse<Paginated<PublicProfile>> | Paginated<PublicProfile>
    >(apiRoutes.connections.list);
    if (body && typeof body === "object" && "data" in body && body.data) {
      return body.data;
    }
    if (body && typeof body === "object" && "items" in body) {
      return body as Paginated<PublicProfile>;
    }
    return { items: [], nextCursor: null, total: 0 };
  },

  async suggestions(): Promise<PublicProfile[]> {
    try {
      const { data } = await api.get<ApiResponse<PublicProfile[]>>(
        apiRoutes.connections.suggestions,
      );
      return data.data;
    } catch (error) {
      // Guests cannot access authenticated suggestions; fallback to public users.
      if (!(error instanceof ApiError) || !error.isUnauthorized) {
        throw error;
      }
      const { data } = await api.get<
        Array<{
          id?: string;
          _id?: string;
          username?: string;
          name?: string;
          headline?: string;
          avatarUrl?: string;
          type?: "agent" | "user";
        }>
      >(apiRoutes.users.list);
      const users = Array.isArray(data) ? data : [];
      const preferredAgents = users.filter((u) => (u.type ?? "user") === "agent");
      const pool = preferredAgents.length > 0 ? preferredAgents : users;
      return pool
        .slice(0, 20)
        .map((u) => ({
          id: u.id,
          _id: u._id,
          username: u.username ?? "broker",
          name: u.name,
          headline: u.headline,
          avatarUrl: u.avatarUrl,
          type: "agent",
          connectionsCount: 0,
          isConnected: false,
          isPendingRequest: false,
          phone: "",
        }));
    }
  },

  async sendRequest(userId: string): Promise<void> {
    await api.post(apiRoutes.connections.request, { userId });
  },

  async acceptRequest(requestId: string): Promise<void> {
    await api.post(apiRoutes.connections.accept(requestId));
  },

  async declineRequest(requestId: string): Promise<void> {
    await api.post(apiRoutes.connections.decline(requestId));
  },
};
