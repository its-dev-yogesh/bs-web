"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, MoreHorizontal, UserPlus, UserMinus, Trash2, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";
import { Button } from "@/components/ui/button/Button";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/date";
import type { PostComment } from "@/services/comment.service";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";

const MENTION_RE = /@([a-zA-Z0-9_]{3,30})/g;

type Props = {
  comments: PostComment[];
  myId?: string;
  postOwnerId?: string;
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



function CommentNode({
  node,
  depth,
  myId,
  postOwnerId,
  isLoggedIn,
  requireLogin,
  onLike,
  onDelete,
  onReply,
  likePending,
  postingReply,
  replyingToId,
  setReplyingToId,
  replyDraft,
  setReplyDraft,
  me,
  renderMentions,
}: {
  node: PostComment;
  depth: number;
  myId?: string;
  postOwnerId?: string;
  isLoggedIn: boolean;
  requireLogin: () => void;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => void | Promise<void>;
  likePending: boolean;
  postingReply: boolean;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyDraft: string;
  setReplyDraft: (v: string) => void;
  me: any;
  renderMentions: (text: string) => React.ReactNode;
}) {
  const likes = node.likes_count ?? 0;
  const liked = Boolean(node.liked);
  const isOwnComment = Boolean(myId && node.user_id === myId);
  const isPostOwner = Boolean(myId && postOwnerId && myId === postOwnerId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const authorName = node.name || (node.username ? `@${node.username}` : "Broker");
  const profileHref = node.username ? appRoutes.profile(node.username) : "#";

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

  return (
    <div className={cn("mt-3 first:mt-0", depth > 0 && "ml-4 sm:ml-10")}>
      <div className="flex gap-2">
        <Link href={profileHref} className="shrink-0">
          <Avatar src={node.avatarUrl} name={authorName} size="sm" className="w-8 h-8" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-surface-muted/50 px-3 py-2 text-[13px] relative">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={profileHref} className="font-bold text-foreground hover:underline truncate max-w-[150px]">
                    {authorName}
                  </Link>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">• 3rd+</span>
                  {node.createdAt && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatRelative(node.createdAt)}
                    </span>
                  )}
                </div>
                {node.headline && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {node.headline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isOwnComment && (
                  <FollowOrConnectButton
                    targetUserId={node.user_id}
                    variant="outline"
                    className="h-6 px-2 text-[10px] border-none text-brand hover:bg-brand-soft font-bold"
                    label={"+ Follow"}
                  />
                )}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1 rounded-full hover:bg-surface-muted text-muted-foreground"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 bottom-full mb-1 z-50 w-40 bg-surface border border-surface-border rounded-xl shadow-lg p-1">
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium hover:bg-surface-muted rounded-lg">
                        <Send className="w-3.5 h-3.5" /> Connect
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium hover:bg-surface-muted rounded-lg">
                        <UserMinus className="w-3.5 h-3.5" /> Unfollow
                      </button>
                      {(isOwnComment || isPostOwner) && (
                        <button
                          onClick={() => {
                            onDelete(node._id);
                            setMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium text-danger hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-foreground mt-1 whitespace-pre-wrap leading-snug">
              {renderMentions(node.content)}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2">
            <button
              type="button"
              disabled={likePending}
              onClick={() => (isLoggedIn ? onLike(node._id, liked) : requireLogin())}
              className={cn(
                "text-[12px] font-bold transition hover:underline flex items-center gap-1",
                liked ? "text-brand" : "text-muted-foreground"
              )}
            >
              Like {likes > 0 && <span className="flex items-center gap-0.5 ml-1"><ThumbsUp className="w-3 h-3 fill-brand text-brand" /> {likes}</span>}
            </button>
            <span className="text-muted-foreground text-[12px]">|</span>
            <button
              type="button"
              className="text-[12px] font-bold text-muted-foreground hover:underline"
              onClick={() => {
                const next = replyingToId === node._id ? null : node._id;
                if (next !== replyingToId) setReplyDraft("");
                setReplyingToId(next);
              }}
            >
              Reply
            </button>
          </div>

          {replyingToId === node._id && isLoggedIn ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
              <Avatar src={me?.avatarUrl} name={me?.name || me?.username} size="sm" className="w-7 h-7 mt-1 hidden sm:block" />
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

          {node.replies && node.replies.length > 0 ? (
            <div className="space-y-1">
              {node.replies.map((r) => (
                <CommentNode
                  key={r._id}
                  node={r}
                  depth={depth + 1}
                  myId={myId}
                  postOwnerId={postOwnerId}
                  isLoggedIn={isLoggedIn}
                  requireLogin={requireLogin}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReply={onReply}
                  likePending={likePending}
                  postingReply={postingReply}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  replyDraft={replyDraft}
                  setReplyDraft={setReplyDraft}
                  me={me}
                  renderMentions={renderMentions}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PostCommentSection({
  comments,
  myId,
  postOwnerId,
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
  const me = useAppStore(selectUser);

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
  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground px-1">No responses yet. Be the first.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {comments.map((c) => (
            <CommentNode
              key={c._id}
              node={c}
              depth={0}
              myId={myId}
              postOwnerId={postOwnerId}
              isLoggedIn={isLoggedIn}
              requireLogin={requireLogin}
              onLike={onLike}
              onDelete={onDelete}
              onReply={onReply}
              likePending={likePending}
              postingReply={postingReply}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              me={me}
              renderMentions={renderMentions}
            />
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start pt-3 border-t border-surface-border/50">
          <Avatar src={me?.avatarUrl} name={me?.name || me?.username} size="sm" className="w-8 h-8 mt-1 hidden sm:block" />
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
        <div className="pt-3 border-t border-surface-border/50 text-center">
          <Link href={appRoutes.login} className="text-xs font-semibold text-brand hover:underline">
            Sign in to comment or reply
          </Link>
        </div>
      )}
    </div>
  );
}
