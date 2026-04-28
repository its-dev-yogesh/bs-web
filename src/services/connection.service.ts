import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse, Paginated, PublicProfile } from "@/types";

export const connectionService = {
  async list(): Promise<Paginated<PublicProfile>> {
    const { data } = await api.get<ApiResponse<Paginated<PublicProfile>>>(
      apiRoutes.connections.list,
    );
    return data.data;
  },

  async suggestions(): Promise<PublicProfile[]> {
    const { data } = await api.get<ApiResponse<PublicProfile[]>>(
      apiRoutes.connections.suggestions,
    );
    return data.data;
  },

  async sendRequest(userId: string): Promise<void> {
    await api.post(apiRoutes.connections.request, { userId });
  },
};
