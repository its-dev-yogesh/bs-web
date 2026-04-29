"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { useComments } from "@/hooks/queries/useComments";
import { useAppStore } from "@/store/main.store";
import { CommentList } from "./CommentList";
import { CommentComposer } from "./CommentComposer";
import type { Comment } from "@/types";

export function PostCommentsModal({
  postId,
  postOwnerId,
  open,
  onClose,
}: {
  postId: string;
  postOwnerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: comments, isLoading } = useComments(postId, open);
  const currentUser = useAppStore((s) => s.user);
  const currentUserId = currentUser?._id ?? currentUser?.id;
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  function handleClose() {
    setReplyingTo(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Comments"
      bodyClassName="flex flex-col p-0"
    >
      <div className="min-h-[40dvh] flex-1 overflow-y-auto px-4 py-3">
        <CommentList
          comments={comments}
          isLoading={isLoading}
          postId={postId}
          postOwnerId={postOwnerId}
          currentUserId={currentUserId}
          onReply={setReplyingTo}
        />
      </div>
      <CommentComposer
        postId={postId}
        autoFocus
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onPosted={() => setReplyingTo(null)}
      />
    </Modal>
  );
}
