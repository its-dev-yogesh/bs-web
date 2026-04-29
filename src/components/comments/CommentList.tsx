"use client";

import { useMemo } from "react";
import { CommentItem } from "./CommentItem";
import type { Comment } from "@/types";

export function CommentList({
  comments,
  isLoading,
  postId,
  postOwnerId,
  currentUserId,
  onReply,
}: {
  comments: Comment[] | undefined;
  isLoading: boolean;
  postId: string;
  postOwnerId: string;
  currentUserId: string | undefined;
  onReply: (comment: Comment) => void;
}) {
  const tree = useMemo(() => buildTree(comments ?? []), [comments]);

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!tree.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {tree.map((node) => (
        <li key={node.id} className="flex flex-col gap-3">
          <CommentItem
            comment={node}
            postId={postId}
            currentUserId={currentUserId}
            postOwnerId={postOwnerId}
            onReply={onReply}
          />
          {node.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              postOwnerId={postOwnerId}
              onReply={onReply}
              isReply
            />
          ))}
        </li>
      ))}
    </ul>
  );
}

type CommentNode = Comment & { replies: Comment[] };

function buildTree(comments: Comment[]): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of comments) {
    byId.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = byId.get(c.id);
    if (!node) continue;
    if (c.parentId && byId.has(c.parentId)) {
      // Flatten any nested reply under its top-level ancestor for a simple
      // single-level reply UI.
      let topId = c.parentId;
      while (true) {
        const parent = byId.get(topId);
        if (!parent || !parent.parentId) break;
        topId = parent.parentId;
      }
      const top = byId.get(topId);
      if (top) {
        top.replies.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return roots;
}
