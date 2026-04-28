"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { Icon } from "@/components/icons/icons";
import { Card } from "@/components/ui/card/Card";
import { appRoutes } from "@/config/routes/app.routes";
import type { User } from "@/types";

const gradients = [
  "from-indigo-500 to-purple-500",
  "from-amber-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-500",
];

export function SuggestionCard({
  user,
  index,
}: {
  user: User;
  index: number;
}) {
  const gradient = gradients[index % gradients.length];

  return (
    <Card className="relative w-44 shrink-0 overflow-hidden">
      <div
        className={`h-14 w-full bg-gradient-to-r ${gradient}`}
        aria-hidden
      />
      <button
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
      >
        <Icon name="close" width={14} height={14} />
      </button>

      <div className="flex flex-col items-center gap-2 px-3 pb-3 -mt-7">
        <Link href={appRoutes.profile(user.username)}>
          <Avatar
            src={user.avatarUrl}
            name={user.name ?? user.username}
            size="lg"
            className="ring-4 ring-surface"
          />
        </Link>
        <Link
          href={appRoutes.profile(user.username)}
          className="line-clamp-1 text-sm font-semibold text-foreground"
        >
          {user.name ?? user.username}
        </Link>
        {user.headline ? (
          <p className="line-clamp-2 text-center text-xs text-muted-foreground">
            {user.headline}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        )}
        <Button variant="outline" size="sm" className="w-full">
          Connect
        </Button>
      </div>
    </Card>
  );
}
