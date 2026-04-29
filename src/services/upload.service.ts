import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

type UploadResponse = {
  key: string;
  bucket: string;
  url: string;
  mime_type: string;
  size: number;
  original_name: string;
};

type UploadFieldsResponse = {
  images: UploadResponse[];
  videos: UploadResponse[];
  documents: UploadResponse[];
};

export const uploadService = {
  async uploadSingle(
    file: File,
    folder = "profiles",
  ): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const { data } = await api.post<UploadResponse>(apiRoutes.uploads.single, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async uploadMixed(
    files: File[],
    folder = "posts",
  ): Promise<UploadFieldsResponse> {
    const form = new FormData();
    for (const file of files) {
      const mime = file.type.toLowerCase();
      if (mime.startsWith("image/")) form.append("images", file);
      else if (mime.startsWith("video/")) form.append("videos", file);
      else form.append("documents", file);
    }
    form.append("folder", folder);
    const { data } = await api.post<UploadFieldsResponse>(apiRoutes.uploads.fields, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      images: data.images ?? [],
      videos: data.videos ?? [],
      documents: data.documents ?? [],
    };
  },
};
