import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { Post } from "@/types";

type BackendFeedItem = {
  post_id: string;
  score: number;
  post: {
    _id: string;
    user_id: string;
    title: string;
    description?: string;
    createdAt?: string;
  };
  media: Array<{ url: string }>;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  inquiries_count: number;
};

export const feedService = {
  async getHome(
    params: { skip?: number; limit?: number } = {},
  ): Promise<Post[]> {
    const { data } = await api.get<BackendFeedItem[]>(
      apiRoutes.feed.home,
      { params },
    );
    return data.map((item) => ({
      id: item.post._id,
      author: {
        id: item.post.user_id,
        username: item.post.user_id,
      },
      content: item.post.description ?? item.post.title,
      mediaUrls: (item.media ?? []).map((m) => m.url),
      likeCount: item.likes_count,
      commentCount: item.comments_count,
      liked: false,
      createdAt: item.post.createdAt ?? new Date().toISOString(),
    }));
  },
};
