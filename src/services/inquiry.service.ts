import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type RawInquiry = {
  _id: string;
  post_id: string;
  post_owner_id: string;
  user_id: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt?: string;
  updatedAt?: string;
};

export const inquiryService = {
  async create(postId: string, message?: string): Promise<RawInquiry> {
    const { data } = await api.post<RawInquiry>(
      apiRoutes.posts.inquiries(postId),
      message ? { message } : {},
    );
    return data;
  },

  async withdraw(postId: string): Promise<void> {
    await api.delete(apiRoutes.posts.inquiries(postId));
  },

  async listForPost(postId: string): Promise<RawInquiry[]> {
    const { data } = await api.get<RawInquiry[]>(
      apiRoutes.posts.inquiries(postId),
    );
    return Array.isArray(data) ? data : [];
  },

  async listSent(): Promise<RawInquiry[]> {
    const { data } = await api.get<RawInquiry[]>(apiRoutes.inquiries.sent);
    return Array.isArray(data) ? data : [];
  },

  async listReceived(): Promise<RawInquiry[]> {
    const { data } = await api.get<RawInquiry[]>(
      apiRoutes.inquiries.received,
    );
    return Array.isArray(data) ? data : [];
  },
};
