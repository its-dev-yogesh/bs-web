import type { User } from "./user";

export type Post = {
  id: string;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl" | "headline">;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
};
