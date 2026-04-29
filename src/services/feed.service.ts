import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { Post } from "@/types";

type BackendFeedAuthor = {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  type?: "agent" | "user";
};

type BackendFeedItem = {
  post_id: string;
  score: number;
  post: {
    _id: string;
    user_id: string;
    type?: "listing" | "requirement";
    title: string;
    description?: string;
    createdAt?: string;
  };
  media: Array<{ url: string }>;
  author?: BackendFeedAuthor | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  inquiries_count: number;
  user_reaction?: string | null;
  is_saved?: boolean;
  is_following_author?: boolean;
  is_inquired?: boolean;
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
    return list.map((item) => {
      const author = item.author;
      const userId = author?.user_id ?? item.post.user_id;
      const username = author?.username ?? userId;
      return {
        id: item.post._id,
        author: {
          id: userId,
          username,
          name: author?.full_name,
          avatarUrl: author?.avatar_url,
          type: author?.type ?? "user",
        },
        title: item.post.title,
        content: item.post.description ?? item.post.title,
        mediaUrls: (item.media ?? []).map((m) => m.url),
        likeCount: item.likes_count,
        commentCount: item.comments_count,
        inquiryCount: item.inquiries_count,
        liked: item.user_reaction === "like",
        saved: item.is_saved === true,
        followingAuthor: item.is_following_author === true,
        inquired: item.is_inquired === true,
        createdAt: item.post.createdAt ?? new Date().toISOString(),
      };
    });
  },
};
