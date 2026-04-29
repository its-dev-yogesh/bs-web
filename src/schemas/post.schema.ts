import { z } from "zod";
import { POST_MAX_LENGTH } from "@/constants";

/** Composer body field only (title/location/post type are separate UI state). */
export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something")
    .max(POST_MAX_LENGTH, `Max ${POST_MAX_LENGTH} characters`),
  mediaUrls: z.array(z.string().url()).max(8),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

/** Sent to `postService.create` — maps to POST /posts/listings or /posts/requirements. */
export type CreatePostPayload = {
  postType: "listing" | "requirement";
  title: string;
  location: string;
  whatsappNumber?: string;
  content: string;
  mediaUrls: string[];
  mediaItems?: Array<{ url: string; type: "image" | "video" | "document" }>;
  // Property listing specific
  price?: number;
  propertyType?: string;
  listingType?: string;
  amenities?: string[];
  projectType?: string;
  projectStatus?: string;
  config?: string;
  address?: string;
  bhk?: number;
  area_sqft?: number;
  bathrooms?: number;
  budgetMin?: number;
  budgetMax?: number;
};
