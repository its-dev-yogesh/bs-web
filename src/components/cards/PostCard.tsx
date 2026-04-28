"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { formatRelative } from "@/lib/date";
import { appRoutes } from "@/config/routes/app.routes";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { mutate: like } = useLikePost();

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <header className="flex items-center gap-3">
        <Link href={appRoutes.profile(post.author.username)}>
          <Avatar
            src={post.author.avatarUrl}
            name={post.author.name}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={appRoutes.profile(post.author.username)}
            className="block truncate text-sm font-semibold"
          >
            {post.author.name}
          </Link>
          {post.author.headline && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {post.author.headline}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatRelative(post.createdAt)}
          </p>
        </div>
      </header>

      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
        {post.content}
      </p>

      <footer className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <Button
          variant={post.liked ? "primary" : "ghost"}
          size="sm"
          onClick={() => like(post.id)}
        >
          {post.liked ? "Liked" : "Like"} · {post.likeCount}
        </Button>
        <Button variant="ghost" size="sm">
          Comment · {post.commentCount}
        </Button>
      </footer>
    </article>
  );
}
