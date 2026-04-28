import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type {
  CreateListingInput,
  CreateRequirementInput,
} from "@/schemas/post.schema";
import type { Post } from "@/types";

export type RawPost = {
  _id: string;
  user_id: string;
  type?: string;
  title?: string;
  description?: string;
  location_text?: string;
  createdAt?: string;
};

function mapRawPost(raw: RawPost): Post {
  return {
    id: raw._id,
    author: { id: raw.user_id, username: raw.user_id },
    title: raw.title,
    content: raw.description ?? raw.title ?? "",
    mediaUrls: [],
    likeCount: 0,
    commentCount: 0,
    liked: false,
    saved: false,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export type ListingItem = Post & { locationText?: string };

type PostWithDetailsResponse = {
  post: RawPost;
};

export const postService = {
  async createListing(input: CreateListingInput): Promise<RawPost> {
    const { data } = await api.post<PostWithDetailsResponse>(
      apiRoutes.posts.createListing,
      {
        title: input.title,
        description: input.description,
        location_text: input.locationText,
        listing: {
          price: input.price,
          property_type: input.propertyType,
          listing_type: input.listingType,
        },
      },
    );
    return data.post;
  },

  async createRequirement(input: CreateRequirementInput): Promise<RawPost> {
    const { data } = await api.post<PostWithDetailsResponse>(
      apiRoutes.posts.createRequirement,
      {
        title: input.title,
        description: input.description,
        location_text: input.locationText,
        requirement: {
          listing_type: input.listingType,
        },
      },
    );
    return data.post;
  },

  async list(params: {
    type?: "listing" | "requirement";
    user_id?: string;
    limit?: number;
    skip?: number;
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

  async unlike(id: string): Promise<void> {
    await api.delete(apiRoutes.posts.reactions(id));
  },

  async save(id: string): Promise<void> {
    await api.post(apiRoutes.posts.save(id));
  },

  async unsave(id: string): Promise<void> {
    await api.delete(apiRoutes.posts.save(id));
  },

  async getById(id: string): Promise<Post> {
    const { data } = await api.get<Post>(apiRoutes.posts.byId(id));
    return data;
  },
};
