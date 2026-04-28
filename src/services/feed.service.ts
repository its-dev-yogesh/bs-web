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
  user_reaction?: string | null;
  is_saved?: boolean;
};

export const feedService = {
  async getHome(
    params: { skip?: number; limit?: number } = {},
  ): Promise<Post[]> {
    const { data } = await api.get<BackendFeedItem[]>(
      apiRoutes.feed.home,
      { params },
    );
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => ({
      id: item.post._id,
      author: {
        id: item.post.user_id,
        username: item.post.user_id,
      },
      title: item.post.title,
      content: item.post.description ?? item.post.title,
      mediaUrls: (item.media ?? []).map((m) => m.url),
      likeCount: item.likes_count,
      commentCount: item.comments_count,
      liked: item.user_reaction === "like",
      saved: item.is_saved === true,
      createdAt: item.post.createdAt ?? new Date().toISOString(),
    }));
  },
};
