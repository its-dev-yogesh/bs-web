import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { ApiResponse } from "@/types";

export type SignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
};

export const uploadService = {
  async sign(input: {
    filename: string;
    contentType: string;
  }): Promise<SignedUpload> {
    const { data } = await api.post<ApiResponse<SignedUpload>>(
      apiRoutes.uploads.sign,
      input,
    );
    return data.data;
  },
};
