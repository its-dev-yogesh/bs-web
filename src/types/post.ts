import type { User } from "./user";

export type Post = {
  id: string;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl" | "headline">;
  title?: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
};
