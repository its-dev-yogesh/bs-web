"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon } from "@/components/icons/icons";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/cn";
import { appRoutes } from "@/config/routes/app.routes";
import { useLikeComment } from "@/hooks/mutations/useLikeComment";
import { useDeleteComment } from "@/hooks/mutations/useDeleteComment";
import { uiActions } from "@/store/actions/ui.actions";
import type { Comment } from "@/types";

export function CommentItem({
  comment,
  postId,
  currentUserId,
  postOwnerId,
  onReply,
  isReply,
}: {
  comment: Comment;
  postId: string;
  currentUserId: string | undefined;
  postOwnerId: string;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
}) {
  const { mutate: like } = useLikeComment(postId);
  const { mutate: remove } = useDeleteComment(postId);

  const canDelete =
    Boolean(currentUserId) &&
    (comment.author.id === currentUserId || postOwnerId === currentUserId);

  function onDelete() {
    if (!confirm("Delete this comment?")) return;
    remove(comment.id, {
      onError: () =>
        uiActions.error("Couldn't delete comment", "Please try again."),
    });
  }

  const profileHref = appRoutes.profile(
    comment.author.id ?? comment.author.username,
  );
  const displayName = comment.author.name ?? comment.author.username;

  return (
    <div className={cn("flex items-start gap-3", isReply && "pl-8")}>
      <Link href={profileHref} className="shrink-0">
        <Avatar src={comment.author.avatarUrl} name={displayName} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-surface-muted px-3 py-2">
          <div className="flex items-baseline gap-2">
            <Link
              href={profileHref}
              className="truncate text-xs font-semibold text-foreground hover:underline"
            >
              {displayName}
            </Link>
            <span className="text-[10px] text-muted-foreground">
              {formatRelative(comment.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 text-sm wrap-break-word whitespace-pre-wrap text-foreground/90">
            {comment.content}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() =>
              like({ id: comment.id, liked: comment.liked })
            }
            className={cn(
              "inline-flex items-center gap-1 font-medium transition hover:text-foreground",
              comment.liked && "text-brand hover:text-brand",
            )}
          >
            <Icon name="heart" width={14} height={14} />
            <span>
              {comment.liked ? "Liked" : "Like"}
              {comment.likeCount > 0 ? ` · ${comment.likeCount}` : ""}
            </span>
          </button>
          {!isReply ? (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="font-medium transition hover:text-foreground"
            >
              Reply
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="font-medium transition hover:text-danger"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
