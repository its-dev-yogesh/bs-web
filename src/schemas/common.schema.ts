import { z } from "zod";

export const idSchema = z.string().min(1);
export const emailSchema = z.string().email();
export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_.-]+$/i, "Letters, numbers, _, ., - only");

export const cursorPaginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
