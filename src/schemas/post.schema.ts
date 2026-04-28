import { z } from "zod";
import { POST_MAX_LENGTH } from "@/constants";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something")
    .max(POST_MAX_LENGTH, `Max ${POST_MAX_LENGTH} characters`),
  mediaUrls: z.array(z.string().url()).max(8),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;
