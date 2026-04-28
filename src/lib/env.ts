import { z } from "zod";

// Accept either a full URL (https://api.example.com) or a same-origin path
// (e.g. "/api") that is rewritten by Next.js to the real backend.
const apiBaseUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
    "Must be an absolute URL or a path starting with /",
  );

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: apiBaseUrlSchema,
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  console.error(
    "Invalid public env vars:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid public environment variables");
}

export const env = parsed.data;
