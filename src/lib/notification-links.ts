import { appRoutes } from "@/config/routes/app.routes";
import type { Notification } from "@/services/notification.service";

/** Map backend `link` + type to an in-app path for Next.js router. */
export function getNotificationHref(item: Notification): string | null {
  const { link, type } = item;
  if (link?.startsWith("/messages?")) {
    try {
      const q = link.includes("?") ? link.slice(link.indexOf("?") + 1) : "";
      const threadId = new URLSearchParams(q).get("thread");
      if (threadId) return appRoutes.thread(threadId);
    } catch {
      return appRoutes.messages;
    }
  }
  if (link?.startsWith("/listings/") || link?.startsWith("/posts/")) return link;
  if (link?.startsWith("/")) return link;
  if (type === "connection_request") return appRoutes.network;
  if (
    type === "post_like" ||
    type === "comment" ||
    type === "mention" ||
    type === "requirement_match"
  ) {
    return appRoutes.listings;
  }
  if (type === "message") return appRoutes.messages;
  return null;
}
