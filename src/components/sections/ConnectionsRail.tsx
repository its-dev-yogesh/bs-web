"use client";

import Link from "next/link";
import { useSuggestedUsers } from "@/hooks/queries/useSuggestedUsers";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon } from "@/components/icons/icons";
import { Card } from "@/components/ui/card/Card";
import { appRoutes } from "@/config/routes/app.routes";

export function ConnectionsRail() {
  const { data: users, isLoading } = useSuggestedUsers(12);

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 overflow-x-auto px-3 py-3">
        <Link
          href={appRoutes.network}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
        >
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted ring-2 ring-brand-soft">
            <Icon name="plus" width={22} height={22} className="text-brand" />
          </span>
          <span className="line-clamp-1 text-[11px] font-medium text-foreground">
            Add
          </span>
        </Link>

        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <RailSkeleton key={i} />)
          : (users ?? []).map((u) => (
              <Link
                key={u._id ?? u.id ?? u.username}
                href={appRoutes.profile(u.username)}
                className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
              >
                <span className="rounded-full p-0.5 ring-2 ring-brand">
                  <Avatar
                    src={u.avatarUrl}
                    name={u.name ?? u.username}
                    size="lg"
                    className="!h-12 !w-12"
                  />
                </span>
                <span className="line-clamp-1 text-[11px] font-medium text-foreground">
                  {u.name ?? u.username}
                </span>
              </Link>
            ))}
      </div>
    </Card>
  );
}

function RailSkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5">
      <span className="h-14 w-14 animate-pulse rounded-full bg-surface-muted" />
      <span className="h-2 w-12 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}
