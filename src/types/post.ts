import type { User } from "./user";

export type Post = {
  id: string;
  author: Pick<
    User,
    "id" | "username" | "name" | "avatarUrl" | "headline" | "type"
  >;
  title?: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  inquiryCount: number;
  liked: boolean;
  saved: boolean;
  followingAuthor: boolean;
  inquired: boolean;
  createdAt: string;
};
