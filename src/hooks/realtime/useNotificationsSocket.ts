"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { queryKeys } from "@/lib/query-keys";
import { env } from "@/lib/env";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { uiActions } from "@/store/actions/ui.actions";

type NewNotificationEvent = {
  id: string;
  type: string;
  actor?: { id?: string; name?: string };
  link?: string;
};

function resolveSocketOrigin(apiBaseUrl: string): string {
  if (typeof window === "undefined") return "";
  /** socket.io uses host + namespace separately; path components in the URL get
   * misread as part of the namespace, so always reduce to the origin. */
  if (/^https?:\/\//i.test(apiBaseUrl)) {
    try {
      return new URL(apiBaseUrl).origin;
    } catch {
      return window.location.origin;
    }
  }
  return window.location.origin;
}

const NOTIFICATION_LABEL: Record<string, string> = {
  connection_request: "sent you a connection request",
  post_like: "liked your post",
  comment: "commented on your post",
  mention: "mentioned you",
  message: "sent you a message",
  requirement_match: "matches your requirement",
};

export function useNotificationsSocket() {
  const user = useAppStore(selectUser);
  const userId = String(user?._id ?? user?.id ?? "").trim();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return;

    const origin = resolveSocketOrigin(env.NEXT_PUBLIC_API_BASE_URL);
    const socket: Socket = io(`${origin}/notifications`, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
    });

    socket.on("notification:new", (payload: NewNotificationEvent) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      const actor = payload?.actor?.name ?? "Someone";
      const verb = NOTIFICATION_LABEL[payload?.type] ?? "sent you a notification";
      uiActions.success(`${actor} ${verb}`);
    });

    return () => {
      socket.removeAllListeners("notification:new");
      socket.disconnect();
    };
  }, [userId, queryClient]);
}
