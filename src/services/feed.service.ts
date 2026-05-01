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
    location_text?: string;
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
  listing?: any;
  requirement?: any;
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
  excludeUserId?: string;
}): Promise<Post[]> {
  const listings = await postService.list({
    status: "active",
    limit: params.limit,
    skip: params.skip,
    exclude_user_id: params.excludeUserId,
  });
  return listings.map(mapListingToFeedPost);
}

export const feedService = {
  /** `excludeUserId` is the viewer's id — passed in by useFeed so the home
   *  feed never shows the viewer's own posts. */
  async getHome(
    params: { skip?: number; limit?: number; excludeUserId?: string } = {},
  ): Promise<Post[]> {
    const token =
      typeof window !== "undefined"
        ? storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
        : null;
    const myId = params.excludeUserId;

    if (!token) {
      return fetchPublicFeedPosts({ ...params, excludeUserId: myId });
    }

    try {
      const { data } = await api.get<BackendFeedItem[]>(
        apiRoutes.feed.home,
        { params: { skip: params.skip, limit: params.limit } },
      );
      const list = Array.isArray(data) ? data : [];
      /** Personalized feed depends on community-queues fan-out. While queues
       *  are disabled (or for new users with no follows yet), the feed is
       *  empty even though there are public posts to browse. Fall back to
       *  the public listing (with own posts filtered out) so the home feed
       *  is never silently empty. */
      if (list.length === 0) {
        return fetchPublicFeedPosts({ ...params, excludeUserId: myId });
      }
      return list
        .filter((item) => !myId || String(item.post.user_id ?? "") !== myId)
        .map((item) => ({
        id: item.post._id,
        type: item.post.type,
        author: authorFromUserId(item.post.user_id),
        title: item.post.title,
        content: item.post.description ?? item.post.title,
        whatsappNumber: item.post.whatsapp_number,
        locationText: item.post.location_text,
        mediaUrls: (item.media ?? [])
          .filter((m) => (m.type ?? "image") === "image")
          .map((m) => m.url),
        mediaItems: (item.media ?? []).map((m) => ({
          url: m.url,
          type: m.type ?? "image",
        })),
        likeCount: item.likes_count ?? 0,
        commentCount: item.comments_count ?? 0,
        repostCount: item.inquiries_count ?? 0,
        saveCount: item.saves_count ?? 0,
        liked:
          item.user_reaction === "like" || item.user_reaction === "interested",
        reposted: false,
        saved: item.is_saved === true,
        createdAt: item.post.createdAt ?? new Date().toISOString(),
        authorConnection: {
          connected: item.author_connected === true,
          pendingOutgoing: item.author_pending_outgoing === true,
          pendingIncoming: item.author_pending_incoming === true,
        },
        // Spread listing details if available
        ...(item.listing ? {
          price: item.listing.price,
          property_type: item.listing.property_type,
          listing_type: item.listing.listing_type,
          amenities: item.listing.amenities,
          project_type: item.listing.project_type,
          project_status: item.listing.project_status,
          config: item.listing.config,
          address: item.listing.address,
          bhk: item.listing.bhk,
          area_sqft: item.listing.area_sqft,
          bathrooms: item.listing.bathrooms,
        } : {}),
        // Spread requirement details if available
        ...(item.requirement ? {
          budget_min: item.requirement.budget_min,
          budget_max: item.requirement.budget_max,
          property_type: item.requirement.property_type,
          listing_type: item.requirement.listing_type,
          amenities: item.requirement.preferred_amenities,
          project_type: item.requirement.project_type,
          project_status: item.requirement.project_status,
          config: item.requirement.config,
          locationText: item.requirement.preferred_location_text,
        } : {}),
      }));
    } catch (error) {
      // JWT missing or expired: use public posts (same browse path as anonymous users).
      if (!(error instanceof ApiError) || !error.isUnauthorized) throw error;
      return fetchPublicFeedPosts({ ...params, excludeUserId: myId });
    }
  },
};
