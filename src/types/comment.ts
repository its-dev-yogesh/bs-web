import type { User } from "./user";

export type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl">;
  content: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
};
