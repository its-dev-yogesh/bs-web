import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { CreatePostInput } from "@/schemas/post.schema";
import type { ApiResponse, Post } from "@/types";

export const postService = {
  async create(input: CreatePostInput): Promise<Post> {
    const { data } = await api.post<ApiResponse<Post>>(
      apiRoutes.posts.create,
      input,
    );
    return data.data;
  },

  async like(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const { data } = await api.post<
      ApiResponse<{ liked: boolean; likeCount: number }>
    >(apiRoutes.posts.like(id));
    return data.data;
  },

  async getById(id: string): Promise<Post> {
    const { data } = await api.get<ApiResponse<Post>>(apiRoutes.posts.byId(id));
    return data.data;
  },
};
