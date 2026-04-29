import type { User } from "./user";

export type Post = {
  id: string;
  type?: "listing" | "requirement";
  author: Pick<User, "id" | "username" | "name" | "avatarUrl" | "headline">;
  title?: string;
  content: string;
  whatsappNumber?: string;
  mediaUrls: string[];
  mediaItems?: Array<{ url: string; type: "image" | "video" | "document" }>;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  /** Populated from authenticated feed: viewer ↔ post author */
  authorConnection?: {
    connected: boolean;
    pendingOutgoing: boolean;
    pendingIncoming: boolean;
  };
  // Property Specific Fields
  price?: number | string;
  property_type?: string;
  listing_type?: string;
  amenities?: string[];
  project_type?: string;
  project_status?: string;
  config?: string;
  address?: string;
  bhk?: number;
  area_sqft?: number;
  bathrooms?: number;
  locationText?: string;
  budget_min?: number;
  budget_max?: number;
  repostCount?: number;
  saveCount?: number;
  reposted?: boolean;
};
