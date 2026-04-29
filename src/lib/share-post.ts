import { appRoutes } from "@/config/routes/app.routes";

export type SharePostPayload = {
  postId: string;
  title?: string;
  excerpt: string;
};

export async function shareBrokerPost(
  payload: SharePostPayload,
): Promise<"shared" | "copied" | "cancelled"> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${appRoutes.listingDetail(payload.postId)}`;
  const text = [payload.title, payload.excerpt].filter(Boolean).join("\n\n");

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: payload.title ?? "Broker Social",
        text,
        url,
      });
      return "shared";
    } catch (e) {
      const err = e as Error;
      if (err?.name === "AbortError") return "cancelled";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text}\n\n${url}`);
    return "copied";
  }

  window.prompt("Copy link:", url);
  return "copied";
}
