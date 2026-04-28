"use client";

import { useNotifications } from "@/hooks/queries/useNotifications";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";
import { Icon } from "@/components/icons/icons";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { Notification } from "@/services/notification.service";

const labels: Record<Notification["type"], string> = {
  connection_request: "sent you a connection request",
  post_like: "liked your post",
  comment: "commented on your post",
  mention: "mentioned you",
  message: "sent you a message",
};

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <h1 className="flex-1 text-base font-semibold text-foreground">
          Notifications
        </h1>
        <button className="text-xs font-medium text-brand">
          Mark all read
        </button>
      </div>

      {isLoading ? (
        <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
          Loading…
        </Card>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Icon name="bell" width={26} height={26} />
          </span>
          <p className="text-sm font-semibold text-foreground">
            You’re all caught up
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            New activity from your network and listings will show up here.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {(data ?? []).map((n) => (
            <NotificationRow key={n.id} item={n} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  return (
    <Card
      className={cn(
        "flex items-start gap-3 px-3 py-3",
        !item.read && "border-l-4 border-l-brand",
      )}
    >
      <Avatar src={item.actor.avatarUrl} name={item.actor.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{item.actor.name}</span>{" "}
          <span className="text-muted-foreground">{labels[item.type]}</span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatRelative(item.createdAt)}
        </p>
      </div>
    </Card>
  );
}
