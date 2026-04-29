import { z } from "zod";
import { BIO_MAX_LENGTH, HEADLINE_MAX_LENGTH } from "@/constants";

/** Empty string or whitespace-only must not run `.url()` — it fails and blocks submit with no obvious feedback. */
const optionalHttpUrl = z.union([
  z.literal(""),
  z.string().trim().url({ message: "Enter a valid URL or leave blank" }),
]);

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscore"),
  name: z.string().trim().min(1).max(80),
  headline: z.string().max(HEADLINE_MAX_LENGTH).optional(),
  bio: z.string().max(BIO_MAX_LENGTH).optional(),
  location: z.string().max(120).optional(),
  avatarUrl: optionalHttpUrl.optional(),
  avatarPositionY: z.number().min(0).max(100).optional(),
  avatarZoom: z.number().min(1).max(3).optional(),
  bannerUrl: optionalHttpUrl.optional(),
  bannerPositionY: z.number().min(0).max(100).optional(),
  bannerZoom: z.number().min(1).max(3).optional(),
  bannerTheme: z.string().max(40).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
