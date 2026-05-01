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

/** astra-service `/s3/upload*` endpoints return a minimal `{ url, key }`.
 *  Recompose the rest of the upload metadata from the File the client picked
 *  so callers downstream still get the full UploadResponse shape. */
function buildUploadResponse(
  file: File,
  raw: { url: string; key: string; bucket?: string },
): UploadResponse {
  return {
    key: raw.key,
    bucket: raw.bucket ?? "",
    url: raw.url,
    mime_type: file.type,
    size: file.size,
    original_name: file.name,
  };
}

/** Multipart options — let the browser set the Content-Type with its own boundary. */
const MULTIPART = { headers: { "Content-Type": undefined } } as const;

function fileKind(file: File): "image" | "video" | "document" {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

/** Pick the right astra endpoint per file type so each file gets the
 *  watermark / transcoding pipeline appropriate for its kind. */
async function uploadOne(file: File, folder: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const kind = fileKind(file);
  const url =
    kind === "video"
      ? apiRoutes.uploads.video
      : kind === "document"
        ? apiRoutes.uploads.pdf
        : apiRoutes.uploads.single;
  const { data } = await api.post<{ url: string; key: string }>(
    url,
    form,
    MULTIPART,
  );
  return buildUploadResponse(file, data);
}

export const uploadService = {
  /**
   * Upload a single file. Routes to the correct astra endpoint based on MIME:
   * images → /s3/upload, videos → /s3/upload-video, others → /s3/upload-pdf.
   */
  uploadSingle(file: File, folder = "profiles"): Promise<UploadResponse> {
    return uploadOne(file, folder);
  },

  uploadVideo(file: File, folder = "videos"): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return api
      .post<{ url: string; key: string }>(
        apiRoutes.uploads.video,
        form,
        MULTIPART,
      )
      .then(({ data }) => buildUploadResponse(file, data));
  },

  uploadPdf(file: File, folder = "documents"): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return api
      .post<{ url: string; key: string }>(
        apiRoutes.uploads.pdf,
        form,
        MULTIPART,
      )
      .then(({ data }) => buildUploadResponse(file, data));
  },

  /**
   * Upload a mix of images, videos, and documents. Files are split per-type
   * client-side and dispatched to the appropriate dedicated endpoint
   * (/s3/upload, /s3/upload-video, /s3/upload-pdf), preserving each pipeline's
   * watermark / transcoding behavior. Results are categorized so callers see
   * the same shape that bs-backend used to return.
   */
  async uploadMixed(
    files: File[],
    folder = "posts",
  ): Promise<UploadFieldsResponse> {
    const empty: UploadFieldsResponse = { images: [], videos: [], documents: [] };
    if (files.length === 0) return empty;

    const settled = await Promise.all(files.map((f) => uploadOne(f, folder)));

    const result: UploadFieldsResponse = { images: [], videos: [], documents: [] };
    files.forEach((file, i) => {
      const built = settled[i];
      if (!built) return;
      const kind = fileKind(file);
      if (kind === "image") result.images.push(built);
      else if (kind === "video") result.videos.push(built);
      else result.documents.push(built);
    });
    return result;
  },

  /** Remove a previously uploaded file by its S3 key. */
  remove(key: string): Promise<void> {
    return api.delete(apiRoutes.uploads.deleteByKey(key)).then(() => undefined);
  },
};
