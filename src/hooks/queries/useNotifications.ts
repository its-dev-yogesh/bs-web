"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { queryKeys } from "@/lib/query-keys";

export function useNotifications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.list(),
    enabled: options?.enabled ?? true,
  });
}

export function useUnreadCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.unreadCount(),
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
