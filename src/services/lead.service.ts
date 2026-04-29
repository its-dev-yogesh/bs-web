import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type Lead = {
  _id: string;
  broker_user_id: string;
  client_user_id: string;
  post_id?: string;
  status: "new" | "contacted" | "converted" | "closed";
  createdAt?: string;
};

export const leadService = {
  async list(): Promise<Lead[]> {
    const { data } = await api.get<{ data: Lead[] } | Lead[]>(apiRoutes.leads.list);
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  },
};
