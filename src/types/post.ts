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
};
