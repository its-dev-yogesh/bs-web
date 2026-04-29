"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon } from "@/components/icons/icons";
import { Card } from "@/components/ui/card/Card";
import { useSavePost } from "@/hooks/mutations/useSavePost";
import { formatRelative } from "@/lib/date";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import type { ListingItem } from "@/services/post.service";

export function ListingCard({ item }: { item: ListingItem }) {
  const { mutate: save } = useSavePost();

  return (
    <Card className="px-3 py-3">
      <div className="flex items-start gap-3">
        <Link
          href={appRoutes.profile(item.author.id ?? item.author.username)}
          className="shrink-0"
        >
          <Avatar
            src={item.author.avatarUrl}
            name={item.author.name ?? item.author.username}
            size="md"
            className="!rounded-md"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={appRoutes.listingDetail(item.id)}
            className="line-clamp-2 text-sm font-semibold text-foreground"
          >
            {item.title ?? item.content}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.author.name ?? item.author.username}
          </p>
          {item.locationText ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="pin" width={12} height={12} />
              {item.locationText}
            </p>
          ) : null}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatRelative(item.createdAt)}
          </p>
        </div>

        <button
          aria-label={item.saved ? "Remove bookmark" : "Bookmark"}
          onClick={() => save({ id: item.id, saved: item.saved })}
          className={cn(
            "shrink-0 rounded-full p-1.5 hover:bg-surface-muted",
            item.saved ? "text-brand" : "text-muted-foreground",
          )}
        >
          <Icon name="bookmark" width={20} height={20} />
        </button>
      </div>
    </Card>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="animate-pulse px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-surface-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-surface-muted" />
          <div className="h-3 w-1/2 rounded bg-surface-muted" />
          <div className="h-3 w-1/3 rounded bg-surface-muted" />
        </div>
      </div>
    </Card>
  );
}
