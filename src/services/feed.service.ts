import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse, Paginated, Post } from "@/types";

export const feedService = {
  async getHome(params: {
    cursor?: string;
    limit?: number;
  } = {}): Promise<Paginated<Post>> {
    const { data } = await api.get<ApiResponse<Paginated<Post>>>(
      apiRoutes.feed.home,
      { params },
    );
    return data.data;
  },
};
