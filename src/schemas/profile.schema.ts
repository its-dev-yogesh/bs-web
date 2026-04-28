import { z } from "zod";
import { BIO_MAX_LENGTH, HEADLINE_MAX_LENGTH } from "@/constants";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  headline: z.string().max(HEADLINE_MAX_LENGTH).optional(),
  bio: z.string().max(BIO_MAX_LENGTH).optional(),
  location: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
