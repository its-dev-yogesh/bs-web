"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/icons";
import { useCommentPost } from "@/hooks/mutations/useCommentPost";
import { uiActions } from "@/store/actions/ui.actions";
import { cn } from "@/lib/cn";
import type { Comment } from "@/types";

export function CommentComposer({
  postId,
  autoFocus,
  replyingTo,
  onCancelReply,
  onPosted,
}: {
  postId: string;
  autoFocus?: boolean;
  replyingTo?: Comment | null;
  onCancelReply?: () => void;
  onPosted?: () => void;
}) {
  const [content, setContent] = useState("");
  const { mutate, isPending } = useCommentPost(postId);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isPending) return;
    mutate(
      { content: trimmed, parentId: replyingTo?.id ?? null },
      {
        onSuccess: () => {
          setContent("");
          onPosted?.();
        },
        onError: () =>
          uiActions.error("Couldn't post comment", "Please try again."),
      },
    );
  }

  const canSubmit = content.trim().length > 0 && !isPending;
  const replyName =
    replyingTo?.author.name ?? replyingTo?.author.username ?? null;

  return (
    <div className="border-t border-surface-border bg-surface">
      {replyingTo ? (
        <div className="flex items-center justify-between gap-2 border-b border-surface-border px-3 py-1.5 text-xs text-muted-foreground">
          <span className="truncate">
            Replying to{" "}
            <span className="font-medium text-foreground">{replyName}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-full p-1 hover:bg-surface-muted"
            aria-label="Cancel reply"
          >
            <Icon name="close" width={14} height={14} />
          </button>
        </div>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 px-3 py-2"
      >
        <input
          autoFocus={autoFocus}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyingTo ? "Write a reply…" : "Write a comment…"}
          className="h-10 flex-1 rounded-full bg-surface-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
          disabled={isPending}
        />
        <button
          type="submit"
          aria-label="Post comment"
          disabled={!canSubmit}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
            canSubmit
              ? "bg-brand text-white hover:bg-brand-hover"
              : "bg-surface-muted text-muted-foreground",
          )}
        >
          <Icon name="send" width={18} height={18} />
        </button>
      </form>
    </div>
  );
}
