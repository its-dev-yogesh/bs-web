"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/date";
import type { PostComment } from "@/services/comment.service";

const MENTION_RE = /@([a-zA-Z0-9_]{3,30})/g;

type Props = {
  comments: PostComment[];
  myId?: string;
  isLoggedIn: boolean;
  requireLogin: () => void;
  commentDraft: string;
  setCommentDraft: (v: string) => void;
  onSubmitTop: () => void;
  postingTop: boolean;
  onLike: (commentId: string, currentlyLiked: boolean) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void | Promise<void>;
  postingReply: boolean;
  likePending: boolean;
  deletingComment?: boolean;
};

export function PostCommentSection({
  comments,
  myId,
  isLoggedIn,
  requireLogin,
  commentDraft,
  setCommentDraft,
  onSubmitTop,
  postingTop,
  onLike,
  onDelete,
  onReply,
  postingReply,
  likePending,
  deletingComment = false,
}: Props) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const labelFor = (node: PostComment) => {
    if (myId && node.user_id === myId) return "You";
    const username = String(node.username ?? "").trim();
    return username ? `@${username}` : "Broker";
  };

  const renderMentions = (text: string) => {
    const parts = text.split(MENTION_RE);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <Link key={`${part}-${idx}`} href={appRoutes.profile(part)} className="font-semibold text-brand hover:underline">
            @{part}
          </Link>
        );
      }
      return <span key={`text-${idx}`}>{part}</span>;
    });
  };

  const handleReplySubmit = async (parentId: string) => {
    const t = replyDraft.trim();
    if (!t) return;
    try {
      await onReply(parentId, t);
      setReplyDraft("");
      setReplyingToId(null);
    } catch {
      /* keep draft; toast from mutation */
    }
  };

  function CommentNode({ node, depth }: { node: PostComment; depth: number }) {
    const likes = node.likes_count ?? 0;
    const liked = Boolean(node.liked);
    const isOwnComment = Boolean(myId && node.user_id === myId);

    return (
      <div
        className={cn(
          depth > 0 && "ml-2 border-l-2 border-surface-border/70 pl-3 mt-2",
        )}
      >
        <div className="rounded-xl bg-surface px-3 py-2.5 text-[13px] shadow-sm border border-surface-border/40">
          <div className="flex gap-2 justify-between items-start">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-foreground">{labelFor(node)}</span>
              <p className="text-foreground mt-0.5 whitespace-pre-wrap leading-snug">{renderMentions(node.content)}</p>
              {node.createdAt ? (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatRelative(node.createdAt)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                type="button"
                disabled={likePending}
                onClick={() => {
                  if (!isLoggedIn) {
                    requireLogin();
                    return;
                  }
                  onLike(node._id, liked);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition",
                  liked
                    ? "bg-brand-soft text-brand"
                    : "text-muted-foreground hover:bg-surface-muted",
                )}
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                <span>{likes}</span>
              </button>
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-[11px] font-bold text-brand hover:underline"
                    onClick={() =>
                      setReplyingToId((id) => {
                        const next = id === node._id ? null : node._id;
                        if (next !== id) setReplyDraft("");
                        return next;
                      })
                    }
                  >
                    Reply
                  </button>
                  {isOwnComment ? (
                    <button
                      type="button"
                      disabled={deletingComment}
                      className="text-[11px] font-semibold text-danger hover:underline disabled:opacity-60"
                      onClick={() => onDelete(node._id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  className="text-[11px] font-semibold text-muted-foreground"
                  onClick={requireLogin}
                >
                  Reply
                </button>
              )}
            </div>
          </div>

          {replyingToId === node._id && isLoggedIn ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="flex-1 rounded-lg border border-surface-border bg-surface-muted/50 px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand min-h-[56px]"
              />
              <Button
                type="button"
                size="sm"
                loading={postingReply}
                disabled={!replyDraft.trim()}
                onClick={() => handleReplySubmit(node._id)}
              >
                Reply
              </Button>
            </div>
          ) : null}
        </div>

        {node.replies && node.replies.length > 0 ? (
          <div className="space-y-0">
            {node.replies.map((r) => (
              <CommentNode key={r._id} node={r} depth={depth + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No responses yet. Be the first.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {comments.map((c) => (
            <CommentNode key={c._id} node={c} depth={0} />
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end pt-1 border-t border-surface-border/50">
          <textarea
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 rounded-xl border border-surface-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand"
          />
          <Button
            type="button"
            size="sm"
            loading={postingTop}
            disabled={!commentDraft.trim()}
            onClick={onSubmitTop}
          >
            Post
          </Button>
        </div>
      ) : (
        <Link href={appRoutes.login} className="text-xs font-semibold text-brand hover:underline inline-block">
          Sign in to comment or reply
        </Link>
      )}
    </div>
  );
}
