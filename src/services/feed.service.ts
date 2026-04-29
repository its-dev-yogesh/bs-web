import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import { ApiError } from "@/lib/api-error";
import type { Post } from "@/types";
import { authorFromUserId } from "@/lib/author-display";
import { STORAGE_KEYS, storage } from "@/lib/storage";
import type { ListingItem } from "@/services/post.service";
import { postService } from "@/services/post.service";

type BackendFeedItem = {
  post_id: string;
  score: number;
  post: {
    _id: string;
    user_id: string;
    type?: "listing" | "requirement";
    title: string;
    description?: string;
    whatsapp_number?: string;
    createdAt?: string;
  };
  media: Array<{ url: string; type?: "image" | "video" | "document" }>;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  inquiries_count: number;
  user_reaction?: string | null;
  is_saved?: boolean;
  author_connected?: boolean;
  author_pending_outgoing?: boolean;
  author_pending_incoming?: boolean;
};

function mapListingToFeedPost(p: ListingItem): Post {
  return {
    ...p,
    authorConnection: {
      connected: false,
      pendingOutgoing: false,
      pendingIncoming: false,
    },
  };
}

async function fetchPublicFeedPosts(params: {
  skip?: number;
  limit?: number;
}): Promise<Post[]> {
  const listings = await postService.list({
    status: "active",
    limit: params.limit,
    skip: params.skip,
  });
  return listings.map(mapListingToFeedPost);
}

export const feedService = {
  async getHome(
    params: { skip?: number; limit?: number } = {},
  ): Promise<Post[]> {
    const token =
      typeof window !== "undefined"
        ? storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
        : null;

    if (!token) {
      return fetchPublicFeedPosts(params);
    }

    try {
      const { data } = await api.get<BackendFeedItem[]>(
        apiRoutes.feed.home,
        { params },
      );
      const list = Array.isArray(data) ? data : [];
      return list.map((item) => ({
        id: item.post._id,
        type: item.post.type,
        author: authorFromUserId(item.post.user_id),
        title: item.post.title,
        content: item.post.description ?? item.post.title,
        whatsappNumber: item.post.whatsapp_number,
        mediaUrls: (item.media ?? [])
          .filter((m) => (m.type ?? "image") === "image")
          .map((m) => m.url),
        mediaItems: (item.media ?? []).map((m) => ({
          url: m.url,
          type: m.type ?? "image",
        })),
        likeCount: item.likes_count,
        commentCount: item.comments_count,
        liked:
          item.user_reaction === "like" || item.user_reaction === "interested",
        saved: item.is_saved === true,
        createdAt: item.post.createdAt ?? new Date().toISOString(),
        authorConnection: {
          connected: item.author_connected === true,
          pendingOutgoing: item.author_pending_outgoing === true,
          pendingIncoming: item.author_pending_incoming === true,
        },
      }));
    } catch (error) {
      // JWT missing or expired: use public posts (same browse path as anonymous users).
      if (!(error instanceof ApiError) || !error.isUnauthorized) throw error;
      return fetchPublicFeedPosts(params);
    }
  },
};
