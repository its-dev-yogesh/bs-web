"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon, type IconName } from "@/components/icons/icons";
import { Card } from "@/components/ui/card/Card";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { useSavePost } from "@/hooks/mutations/useSavePost";
import { formatRelative } from "@/lib/date";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { MediaGrid } from "./MediaGrid";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { mutate: like } = useLikePost();
  const { mutate: save } = useSavePost();

  return (
    <Card>
      <header className="flex items-start gap-3 px-4 pt-4">
        <Link href={appRoutes.profile(post.author.username)}>
          <Avatar
            src={post.author.avatarUrl}
            name={post.author.name ?? post.author.username}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={appRoutes.profile(post.author.username)}
            className="block truncate text-sm font-semibold text-foreground"
          >
            {post.author.name ?? post.author.username}
          </Link>
          {post.author.headline ? (
            <p className="truncate text-xs text-muted-foreground">
              {post.author.headline}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {formatRelative(post.createdAt)}
          </p>
        </div>
        <button
          aria-label="More"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted"
        >
          <Icon name="more" width={20} height={20} />
        </button>
      </header>

      {post.title ? (
        <h3 className="mt-3 px-4 text-sm font-semibold text-foreground">
          {post.title}
        </h3>
      ) : null}

      {post.content ? (
        <p className="mt-2 px-4 text-sm whitespace-pre-wrap text-foreground/90">
          {post.content}
        </p>
      ) : null}

      {post.mediaUrls.length > 0 ? (
        <div className="mt-3 px-0.5">
          <MediaGrid urls={post.mediaUrls} />
        </div>
      ) : null}

      <Stats likeCount={post.likeCount} commentCount={post.commentCount} />

      <div className="grid grid-cols-4 border-t border-surface-border">
        <Action
          icon="heart"
          label={post.liked ? "Liked" : "Like"}
          active={post.liked}
          onClick={() => like({ id: post.id, liked: post.liked })}
        />
        <Action icon="comment" label="Comment" />
        <Action icon="share" label="Share" />
        <Action
          icon="bookmark"
          label={post.saved ? "Saved" : "Save"}
          active={post.saved}
          onClick={() => save({ id: post.id, saved: post.saved })}
        />
      </div>
    </Card>
  );
}

function Stats({
  likeCount,
  commentCount,
}: {
  likeCount: number;
  commentCount: number;
}) {
  if (likeCount === 0 && commentCount === 0) {
    return <div className="px-4 pb-2 pt-3" />;
  }
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        {likeCount > 0 ? (
          <>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
              <Icon name="heart" width={10} height={10} strokeWidth={3} />
            </span>
            {likeCount}
          </>
        ) : null}
      </span>
      <span>{commentCount > 0 ? `${commentCount} comments` : ""}</span>
    </div>
  );
}

function Action({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition",
        active
          ? "text-brand"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon name={icon} width={20} height={20} />
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}
