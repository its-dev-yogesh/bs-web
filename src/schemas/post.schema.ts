import { z } from "zod";
import { POST_MAX_LENGTH } from "@/constants";

export const PROPERTY_TYPES = ["flat", "house", "villa", "plot"] as const;
export const LISTING_SALE_RENT = ["sale", "rent"] as const;
export const REQUIREMENT_BUY_RENT = ["buy", "rent"] as const;

const baseFields = {
  title: z.string().trim().min(1, "Title required").max(120, "Max 120 chars"),
  description: z
    .string()
    .trim()
    .max(POST_MAX_LENGTH, `Max ${POST_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  locationText: z.string().trim().max(200).optional(),
};

export const createListingSchema = z.object({
  kind: z.literal("listing"),
  ...baseFields,
  price: z.number().positive("Price must be greater than 0"),
  propertyType: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_SALE_RENT),
});

export const createRequirementSchema = z.object({
  kind: z.literal("requirement"),
  ...baseFields,
  listingType: z.enum(REQUIREMENT_BUY_RENT),
});

export const createPostSchema = z.discriminatedUnion("kind", [
  createListingSchema,
  createRequirementSchema,
]);

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
