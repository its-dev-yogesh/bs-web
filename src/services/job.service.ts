import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse, Job, Paginated } from "@/types";

export const jobService = {
  async list(params: {
    cursor?: string;
    q?: string;
  } = {}): Promise<Paginated<Job>> {
    const { data } = await api.get<ApiResponse<Paginated<Job>>>(
      apiRoutes.jobs.list,
      { params },
    );
    return data.data;
  },

  async getById(id: string): Promise<Job> {
    const { data } = await api.get<ApiResponse<Job>>(apiRoutes.jobs.byId(id));
    return data.data;
  },

  async apply(id: string, payload: { coverLetter?: string }): Promise<void> {
    await api.post(apiRoutes.jobs.apply(id), payload);
  },
};
