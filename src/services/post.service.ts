import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { CreatePostPayload } from "@/schemas/post.schema";
import type { Post } from "@/types";
import { authorFromUserId } from "@/lib/author-display";

export type RawPostAuthor = {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
};

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
  /** Engagement aggregates added by GET /posts list endpoint */
  likes_count?: number;
  saves_count?: number;
  comments_count?: number;
  user_reaction?: string | null;
  is_saved?: boolean;
  /** Denormalized author info attached server-side. */
  author?: RawPostAuthor;
};

type PostWithDetailsResponse = {
  post: RawPost;
  media?: Array<{ url?: string; type?: "image" | "video" | "document" }>;
  author?: RawPostAuthor;
};

type RawEnrichedUser = {
  user_id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  headline?: string;
  type?: string;
  createdAt?: string;
};

export type PostUserSummary = {
  userId: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  headline?: string;
  reactionType?: string;
  createdAt?: string;
};

function mapEnrichedUser(u: RawEnrichedUser): PostUserSummary {
  return {
    userId: String(u.user_id ?? ""),
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    headline: u.headline,
    reactionType: u.type,
    createdAt: u.createdAt,
  };
}

/** Prefer the server-attached author info; fall back to the synthetic
 *  user_id-based label for older payloads or missing joins. */
function resolveAuthor(
  user_id: string,
  attached: RawPostAuthor | undefined,
): { id: string; username: string; name?: string } {
  if (attached) {
    const id = String(attached.id ?? attached._id ?? user_id ?? "");
    const username = String(attached.username ?? "").trim();
    const name = String(attached.name ?? "").trim();
    if (id && (username || name)) {
      return {
        id,
        username: username || name,
        name: name || username || undefined,
      };
    }
  }
  return authorFromUserId(user_id);
}

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
    author: resolveAuthor(p.user_id, res.author ?? p.author),
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
    author: resolveAuthor(raw.user_id, raw.author),
    title: raw.title,
    content: raw.description ?? raw.title ?? "",
    whatsappNumber: raw.whatsapp_number,
    mediaUrls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    mediaItems: (Array.isArray(raw.media_urls) ? raw.media_urls : []).map((url) => ({
      url,
      type: "image",
    })),
    likeCount: raw.likes_count ?? 0,
    commentCount: raw.comments_count ?? 0,
    saveCount: raw.saves_count ?? 0,
    liked:
      raw.user_reaction === "like" || raw.user_reaction === "interested",
    saved: raw.is_saved === true,
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
            price: payload.price ?? 0,
            property_type: payload.propertyType ?? "flat",
            listing_type: payload.listingType ?? "sale",
            amenities: payload.amenities ?? [],
            project_type: payload.projectType,
            project_status: payload.projectStatus,
            config: payload.config,
            address: payload.address,
            bhk: payload.bhk,
            area_sqft: payload.area_sqft,
            bathrooms: payload.bathrooms,
          },
        },
      );
      data = created;
    } else {
      const { data: created } = await api.post<PostWithDetailsResponse>(
        apiRoutes.posts.createRequirement,
        {
          ...base,
          requirement: {
            budget_min: payload.budgetMin,
            budget_max: payload.budgetMax,
            property_type: payload.propertyType ?? "flat",
            listing_type: payload.listingType ?? "buy",
            config: payload.config,
            project_type: payload.projectType,
            project_status: payload.projectStatus,
            preferred_amenities: payload.amenities ?? [],
            preferred_location_text: location.trim(),
          },
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
    /** Hide posts authored by this user (used by the home feed). */
    exclude_user_id?: string;
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

  async listReactions(id: string): Promise<PostUserSummary[]> {
    const { data } = await api.get<RawEnrichedUser[]>(
      apiRoutes.posts.reactions(id),
    );
    return (Array.isArray(data) ? data : []).map(mapEnrichedUser);
  },

  /** Owner-only on the backend — non-owners get 403. */
  async listSavers(id: string): Promise<PostUserSummary[]> {
    const { data } = await api.get<RawEnrichedUser[]>(
      apiRoutes.posts.saves(id),
    );
    return (Array.isArray(data) ? data : []).map(mapEnrichedUser);
  },

  async listMedia(
    id: string,
  ): Promise<Array<{ id: string; url: string; type: "image" | "video" | "document" }>> {
    const { data } = await api.get<
      Array<{ _id: string; url: string; type: "image" | "video" | "document" }>
    >(apiRoutes.posts.media(id));
    return (data ?? []).map((m) => ({ id: m._id, url: m.url, type: m.type ?? "image" }));
  },

  async addMedia(
    id: string,
    media: { url: string; type: "image" | "video" | "document"; orderIndex?: number },
  ): Promise<void> {
    await api.post(apiRoutes.posts.media(id), {
      url: media.url,
      type: media.type,
      order_index: media.orderIndex ?? 0,
    });
  },

  async removeMedia(mediaId: string): Promise<void> {
    await api.delete(apiRoutes.posts.mediaItem(mediaId));
  },

  async update(
    id: string,
    input: {
      title?: string;
      description?: string;
      location_text?: string;
      whatsapp_number?: string;
      // listing fields
      price?: number;
      listing_type?: string;
      property_type?: string;
      project_type?: string;
      project_status?: string;
      config?: string;
      address?: string;
      area_sqft?: number;
      bhk?: number;
      bathrooms?: number;
      amenities?: string[];
      // requirement fields
      budget_min?: number;
      budget_max?: number;
      preferred_amenities?: string[];
      preferred_location_text?: string;
      // routing
      postType?: "listing" | "requirement";
    },
  ): Promise<Post> {
    const {
      title,
      description,
      location_text,
      whatsapp_number,
      price,
      listing_type,
      property_type,
      project_type,
      project_status,
      config,
      address,
      area_sqft,
      bhk,
      bathrooms,
      amenities,
      budget_min,
      budget_max,
      preferred_amenities,
      preferred_location_text,
      postType,
    } = input;
    const baseFields: Record<string, unknown> = {};
    if (title !== undefined) baseFields.title = title;
    if (description !== undefined) baseFields.description = description;
    if (location_text !== undefined) baseFields.location_text = location_text;
    if (whatsapp_number !== undefined) baseFields.whatsapp_number = whatsapp_number;
    if (Object.keys(baseFields).length > 0) {
      await api.put(apiRoutes.posts.byId(id), baseFields);
    }
    if (postType === "listing") {
      const listingFields: Record<string, unknown> = {};
      if (price !== undefined) listingFields.price = price;
      if (listing_type !== undefined) listingFields.listing_type = listing_type;
      if (property_type !== undefined) listingFields.property_type = property_type;
      if (project_type !== undefined) listingFields.project_type = project_type;
      if (project_status !== undefined) listingFields.project_status = project_status;
      if (config !== undefined) listingFields.config = config;
      if (address !== undefined) listingFields.address = address;
      if (area_sqft !== undefined) listingFields.area_sqft = area_sqft;
      if (bhk !== undefined) listingFields.bhk = bhk;
      if (bathrooms !== undefined) listingFields.bathrooms = bathrooms;
      if (amenities !== undefined) listingFields.amenities = amenities;
      if (Object.keys(listingFields).length > 0) {
        await api.put(apiRoutes.posts.updateListing(id), listingFields);
      }
    } else if (postType === "requirement") {
      const reqFields: Record<string, unknown> = {};
      if (budget_min !== undefined) reqFields.budget_min = budget_min;
      if (budget_max !== undefined) reqFields.budget_max = budget_max;
      if (listing_type !== undefined) reqFields.listing_type = listing_type;
      if (property_type !== undefined) reqFields.property_type = property_type;
      if (project_type !== undefined) reqFields.project_type = project_type;
      if (project_status !== undefined) reqFields.project_status = project_status;
      if (config !== undefined) reqFields.config = config;
      if (preferred_amenities !== undefined) reqFields.preferred_amenities = preferred_amenities;
      if (preferred_location_text !== undefined) reqFields.preferred_location_text = preferred_location_text;
      if (Object.keys(reqFields).length > 0) {
        await api.put(apiRoutes.posts.updateRequirement(id), reqFields);
      }
    }
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
};
