import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type PostComment = {
  _id: string;
  post_id: string;
  user_id: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  headline?: string;
  parent_id?: string | null;
  content: string;
  createdAt?: string;
  likes_count?: number;
  liked?: boolean;
  replies?: PostComment[];
};

function unwrapComment(data: unknown): PostComment {
  if (data && typeof data === "object" && "content" in data && "_id" in data) {
    return data as PostComment;
  }
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: PostComment }).data;
  }
  throw new Error("Invalid comment response");
}

export const commentService = {
  async list(postId: string): Promise<PostComment[]> {
    const { data } = await api.get<unknown>(apiRoutes.posts.comments(postId));
    if (Array.isArray(data)) return data as PostComment[];
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: PostComment[] }).data;
    }
    return [];
  },

  async create(postId: string, content: string, parentId?: string | null): Promise<PostComment> {
    const { data } = await api.post<unknown>(apiRoutes.posts.comments(postId), {
      content,
      ...(parentId ? { parent_id: parentId } : {}),
    });
    return unwrapComment(data);
  },

  async like(commentId: string): Promise<{ liked: boolean; likes_count: number }> {
    const { data } = await api.post<unknown>(apiRoutes.commentLikes.like(commentId));
    if (data && typeof data === "object" && "likes_count" in data) {
      return data as { liked: boolean; likes_count: number };
    }
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: { liked: boolean; likes_count: number } }).data;
    }
    throw new Error("Invalid like response");
  },

  async unlike(commentId: string): Promise<{ liked: boolean; likes_count: number }> {
    const { data } = await api.delete<unknown>(apiRoutes.commentLikes.like(commentId));
    if (data && typeof data === "object" && "likes_count" in data) {
      return data as { liked: boolean; likes_count: number };
    }
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: { liked: boolean; likes_count: number } }).data;
    }
    throw new Error("Invalid unlike response");
  },

  async remove(commentId: string): Promise<void> {
    await api.delete(apiRoutes.comments.byId(commentId));
  },
};
