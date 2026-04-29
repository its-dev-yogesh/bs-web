import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { CreatePostPayload } from "@/schemas/post.schema";
import type { Post } from "@/types";
import { authorFromUserId } from "@/lib/author-display";

export type RawPost = {
  _id: string;
  user_id: string;
  type?: "listing" | "requirement";
  title?: string;
  description?: string;
  location_text?: string;
  whatsapp_number?: string;
  createdAt?: string;
  /** From GET /posts list when backend attaches media */
  media_urls?: string[];
};

type PostWithDetailsResponse = {
  post: RawPost;
  media?: Array<{ url?: string; type?: "image" | "video" | "document" }>;
};

function mapPostWithDetails(res: PostWithDetailsResponse): Post {
  const p = res.post;
  const mediaItems = (res.media ?? [])
    .map((m) => ({ url: m.url, type: m.type ?? "image" }))
    .filter(
      (m): m is { url: string; type: "image" | "video" | "document" } =>
        Boolean(m.url),
    );
  const urls = mediaItems.filter((m) => m.type === "image").map((m) => m.url);
  return {
    id: p._id,
    type: p.type,
    author: authorFromUserId(p.user_id),
    title: p.title,
    content: p.description ?? p.title ?? "",
    whatsappNumber: p.whatsapp_number,
    mediaUrls: urls,
    mediaItems,
    likeCount: 0,
    commentCount: 0,
    liked: false,
    saved: false,
    createdAt:
      typeof p.createdAt === "string"
        ? p.createdAt
        : p.createdAt != null
          ? new Date(p.createdAt).toISOString()
          : new Date().toISOString(),
  };
}

function mapRawPost(raw: RawPost): Post {
  return {
    id: raw._id,
    type: raw.type,
    author: authorFromUserId(raw.user_id),
    title: raw.title,
    content: raw.description ?? raw.title ?? "",
    whatsappNumber: raw.whatsapp_number,
    mediaUrls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    mediaItems: (Array.isArray(raw.media_urls) ? raw.media_urls : []).map((url) => ({
      url,
      type: "image",
    })),
    likeCount: 0,
    commentCount: 0,
    inquiryCount: 0,
    liked: false,
    saved: false,
    followingAuthor: false,
    inquired: false,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export type ListingItem = Post & { locationText?: string };

export const postService = {
  async create(payload: CreatePostPayload): Promise<Post> {
    const {
      postType,
      title,
      location,
      whatsappNumber,
      content,
      mediaUrls,
      mediaItems,
    } = payload;

    const base: Record<string, unknown> = {
      title:
        title.trim() ||
        (postType === "listing" ? "Property listing" : "Client requirement"),
    };
    if (content.trim()) base.description = content.trim();
    if (location.trim()) base.location_text = location.trim();
    if (whatsappNumber?.trim()) base.whatsapp_number = whatsappNumber.trim();

    let data: PostWithDetailsResponse;

    if (postType === "listing") {
      const { data: created } = await api.post<PostWithDetailsResponse>(
        apiRoutes.posts.createListing,
        {
          ...base,
          listing: {
            price: 0,
            property_type: "flat",
            listing_type: "sale",
          },
        },
      );
      data = created;
    } else {
      const requirement: Record<string, unknown> = {
        listing_type: "buy",
      };
      if (location.trim()) {
        requirement.preferred_location_text = location.trim();
      }
      const { data: created } = await api.post<PostWithDetailsResponse>(
        apiRoutes.posts.createRequirement,
        {
          ...base,
          requirement,
        },
      );
      data = created;
    }

    const postId = data.post?._id;
    const mergedMedia =
      mediaItems && mediaItems.length > 0
        ? mediaItems
        : mediaUrls.map((url) => ({ url, type: "image" as const }));

    if (postId && mergedMedia.length > 0) {
      for (let i = 0; i < mergedMedia.length; i++) {
        const media = mergedMedia[i];
        await api.post(apiRoutes.posts.media(postId), {
          url: media.url,
          type: media.type,
          order_index: i,
        });
      }
      const { data: full } = await api.get<PostWithDetailsResponse>(
        apiRoutes.posts.byId(postId),
      );
      return mapPostWithDetails(full);
    }

    return mapPostWithDetails(data);
  },

  async list(params: {
    type?: "listing" | "requirement";
    user_id?: string;
    limit?: number;
    skip?: number;
    /** Published posts only — use on profile timelines */
    status?: "active" | "draft" | "inactive";
  } = {}): Promise<ListingItem[]> {
    const { data } = await api.get<RawPost[]>(apiRoutes.posts.list, { params });
    const list = Array.isArray(data) ? data : [];
    return list.map((raw) => ({
      ...mapRawPost(raw),
      locationText: raw.location_text,
    }));
  },

  async savedList(): Promise<ListingItem[]> {
    const { data } = await api.get<RawPost[] | { post: RawPost }[]>(
      apiRoutes.savedPosts.list,
    );
    const list = Array.isArray(data) ? data : [];
    const raws = list.map((entry) =>
      "post" in entry && entry.post ? entry.post : (entry as RawPost),
    );
    return raws
      .filter((r): r is RawPost => Boolean(r && r._id))
      .map((raw) => ({
        ...mapRawPost(raw),
        locationText: raw.location_text,
        saved: true,
      }));
  },

  async like(id: string): Promise<void> {
    await api.post(apiRoutes.posts.reactions(id), { type: "like" });
  },

  async update(
    id: string,
    input: {
      title?: string;
      description?: string;
      location_text?: string;
      whatsapp_number?: string;
    },
  ): Promise<Post> {
    await api.put(apiRoutes.posts.byId(id), input);
    return this.getById(id);
  },

  async unlike(id: string): Promise<void> {
    await api.delete(apiRoutes.posts.reactions(id));
  },

  async remove(id: string): Promise<void> {
    await api.delete(apiRoutes.posts.byId(id));
  },

  async save(id: string): Promise<void> {
    await api.post(apiRoutes.posts.save(id));
  },

  async unsave(id: string): Promise<void> {
    await api.delete(apiRoutes.posts.save(id));
  },

  async getById(id: string): Promise<Post> {
    const { data } = await api.get<PostWithDetailsResponse>(
      apiRoutes.posts.byId(id),
    );
    return mapPostWithDetails(data);
  },

  async listComments(postId: string): Promise<Comment[]> {
    const { data } = await api.get<RawComment[]>(
      apiRoutes.posts.comments(postId),
    );
    const list = Array.isArray(data) ? data : [];
    return list.map(mapRawComment);
  },

  async createComment(
    postId: string,
    content: string,
    parentId?: string | null,
  ): Promise<Comment> {
    const { data } = await api.post<RawComment>(
      apiRoutes.posts.comments(postId),
      { content, parent_id: parentId ?? null },
    );
    return mapRawComment(data);
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(apiRoutes.comments.byId(commentId));
  },

  async likeComment(commentId: string): Promise<void> {
    await api.post(apiRoutes.comments.reactions(commentId));
  },

  async unlikeComment(commentId: string): Promise<void> {
    await api.delete(apiRoutes.comments.reactions(commentId));
  },
};
