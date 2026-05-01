"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/queries/useNotifications";
import { appRoutes } from "@/config/routes/app.routes";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/mutations/useNotificationMutations";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/cn";
import { Bell, Sparkles, MessageSquare, Users, FileText, Loader2, UserPlus } from "lucide-react";
import type { Notification } from "@/services/notification.service";
import { getNotificationHref } from "@/lib/notification-links";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";

const labels: Record<Notification["type"], string> = {
  connection_request: "sent you a broker connection request",
  follow: "started following you",
  post_like: "is interested in your property post",
  comment: "commented on your listing",
  mention: "mentioned you",
  message: "sent you a message",
  requirement_match: "matched your client requirement",
};

type FilterKey = "all" | "posts" | "network" | "messages";

function matchesFilter(n: Notification, f: FilterKey): boolean {
  switch (f) {
    case "all":
      return true;
    case "posts":
      return (
        n.type === "post_like" ||
        n.type === "comment" ||
        n.type === "mention" ||
        n.type === "requirement_match"
      );
    case "network":
      return n.type === "connection_request" || n.type === "follow";
    case "messages":
      return n.type === "message";
    default:
      return true;
  }
}

export function NotificationsPage() {
  const router = useRouter();
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const [filter, setFilter] = useState<FilterKey>("all");
  const { data, isLoading } = useNotifications({ enabled: isLoggedIn });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();
  const filtered = useMemo(() => {
    const list = data ?? [];
    return list.filter((n) => matchesFilter(n, filter));
  }, [data, filter]);
  const unreadCount = useMemo(
    () => (data ?? []).filter((n) => !n.read).length,
    [data],
  );

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto text-center space-y-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Bell className="w-7 h-7" />
        </span>
        <h1 className="text-[18px] font-bold text-foreground">Notifications are for signed-in brokers</h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account to see alerts for messages, listings, and your network.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={appRoutes.login}
            className="rounded-full border border-surface-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            Sign in
          </Link>
          <Link
            href={appRoutes.register}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  const sidebarFilters: { key: FilterKey; label: string; description: string }[] = [
    { key: "all", label: "All", description: "Everything" },
    { key: "posts", label: "Listings & posts", description: "Likes, comments, mentions" },
    { key: "network", label: "Network", description: "Connection requests" },
    { key: "messages", label: "Messages", description: "DM notifications" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 md:px-0 max-w-[1000px] mx-auto">
      <aside className="w-full md:w-[250px] shrink-0">
        <Card className="p-4 rounded-xl shadow-sm border-surface-border/50 bg-surface">
          <h2 className="font-bold text-[16px] text-foreground mb-3">Manage notifications</h2>
          <nav className="flex flex-col gap-1">
            {sidebarFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition",
                  filter === f.key
                    ? "bg-brand-soft text-brand border-l-4 border-brand rounded-l-none font-semibold"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
              >
                <span className="text-[14px] block">{f.label}</span>
                <span className="text-[11px] opacity-80 font-normal">{f.description}</span>
              </button>
            ))}
          </nav>
        </Card>
      </aside>

      <div className="flex-1">
        <Card className="rounded-xl border border-surface-border/50 shadow-sm bg-surface overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-surface-border/50 gap-3 flex-wrap">
            <h1 className="text-[16px] font-bold text-foreground">Notifications</h1>
            <button
              type="button"
              disabled={markingAll || unreadCount === 0}
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-2 text-brand hover:underline font-bold text-[14px] disabled:opacity-50 disabled:no-underline"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Mark all read
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading notifications…
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Bell className="w-6 h-6" />
              </span>
              <p className="text-sm font-bold text-foreground">You’re all caught up</p>
              <p className="max-w-xs text-[12px] text-muted-foreground">
                New broker activity for listings and client requirements will land here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
                <Bell className="w-6 h-6" />
              </span>
              <p className="text-sm font-bold text-foreground">Nothing in this view</p>
              <p className="max-w-xs text-[12px] text-muted-foreground">
                Try another filter or check back later.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border/50">
              {filtered.map((n) => (
                <NotificationRow
                  key={n.id}
                  item={n}
                  onOpen={() => {
                    markRead(n.id);
                    const href = getNotificationHref(n);
                    if (href) router.push(href);
                  }}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: Notification;
  onOpen: () => void;
}) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "post_like":
        return <Sparkles className="w-4 h-4 text-orange-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "connection_request":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case "comment":
      case "mention":
      case "requirement_match":
        return <FileText className="w-4 h-4 text-violet-600" />;
      default:
        return <Bell className="w-4 h-4 text-brand" />;
    }
  };

  const href = getNotificationHref(item);
  const isFollow = item.type === "follow";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "flex w-full items-start justify-between p-4 text-left hover:bg-surface-muted transition gap-3 cursor-pointer",
        !item.read && "bg-blue-50/40 border-l-4 border-brand dark:bg-blue-950/20",
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="relative shrink-0">
          <Avatar src={item.actor.avatarUrl} name={item.actor.name} size="md" />
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface p-1 rounded-full shadow border border-gray-100 dark:border-surface-border">
            {getIcon(item.type)}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[14px] text-foreground leading-normal font-medium">
            <span className="font-bold text-foreground">{item.actor.name}</span>{" "}
            {labels[item.type]}
          </p>
          <span className="text-[12px] text-muted-foreground mt-1 block">
            {formatRelative(item.createdAt)}
          </span>
          {!isFollow && href ? (
            <span className="text-[11px] font-semibold text-brand mt-1 inline-block">
              Open →
            </span>
          ) : null}
        </div>
      </div>
      {isFollow && item.actor.id ? (
        <div onClick={(e) => e.stopPropagation()}>
          <FollowOrConnectButton
            targetUserId={item.actor.id}
            variant="primary"
            label="Follow back"
            // The actor follows me, so this is always a follow-back affordance.
            serverPendingIncoming
            className="text-[12px] px-3 py-1"
          />
        </div>
      ) : null}
    </div>
  );
}
