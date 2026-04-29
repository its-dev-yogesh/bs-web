import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type PostInsight = {
  post_id: string;
  title: string;
  description?: string;
  createdAt?: string;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  inquiries_count: number;
};

export type InsightsSummary = {
  posts_count: number;
  followers_count: number;
  following_count: number;
  total_likes: number;
  total_comments: number;
  total_saves: number;
  total_inquiries: number;
};

export type InsightsResponse = {
  summary: InsightsSummary;
  posts: PostInsight[];
};

export const meService = {
  async getInsights(): Promise<InsightsResponse> {
    const { data } = await api.get<InsightsResponse>(apiRoutes.me.insights);
    return data;
  },
};
