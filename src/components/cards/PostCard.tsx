"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon, type IconName } from "@/components/icons/icons";
import { Card } from "@/components/ui/card/Card";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { useSavePost } from "@/hooks/mutations/useSavePost";
import { useFollowUser } from "@/hooks/mutations/useFollowUser";
import { useConnectPost } from "@/hooks/mutations/useConnectPost";
import { formatRelative } from "@/lib/date";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { sharePost } from "@/lib/share";
import { uiActions } from "@/store/actions/ui.actions";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { PostCommentsModal } from "@/components/comments/PostCommentsModal";
import { MediaGrid } from "./MediaGrid";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { mutate: like } = useLikePost();
  const { mutate: save } = useSavePost();
  const { mutate: follow } = useFollowUser();
  const { mutate: connect, isPending: connectPending } = useConnectPost();
  const [commentsOpen, setCommentsOpen] = useState(false);

  const me = useAppStore(selectUser);
  const myId = me?._id ?? me?.id;
  const authorId = post.author.id;
  const isOwnPost = Boolean(myId && authorId && myId === authorId);

  async function onShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/?post=${post.id}`
        : `/?post=${post.id}`;
    const result = await sharePost({
      url,
      title: post.title ?? post.author.name ?? post.author.username,
      text: post.content,
    });
    if (result === "copied") uiActions.success("Link copied to clipboard");
    else if (result === "failed")
      uiActions.error("Couldn't share", "Try copying the link manually.");
  }

  function onFollow() {
    if (!authorId) return;
    follow(
      { userId: authorId, following: post.followingAuthor },
      {
        onError: () =>
          uiActions.error("Couldn't update follow", "Please try again."),
      },
    );
  }

  function onConnect() {
    connect(
      { id: post.id, inquired: post.inquired },
      {
        onSuccess: () =>
          post.inquired
            ? uiActions.success("Inquiry withdrawn")
            : uiActions.success(
                "Interest sent",
                "The poster can now see your interest.",
              ),
        onError: () =>
          uiActions.error("Couldn't connect", "Please try again."),
      },
    );
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <header className="flex items-start gap-3 px-4 pt-4">
        <Link href={appRoutes.profile(authorId ?? post.author.username)}>
          <Avatar
            src={post.author.avatarUrl}
            name={post.author.name ?? post.author.username}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={appRoutes.profile(authorId ?? post.author.username)}
              className="block truncate text-sm font-semibold text-foreground"
            >
              {post.author.name ?? post.author.username}
            </Link>
            {!isOwnPost && authorId ? (
              <button
                type="button"
                onClick={onFollow}
                className={cn(
                  "shrink-0 text-xs font-semibold transition",
                  post.followingAuthor
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-brand hover:text-brand-hover",
                )}
              >
                {post.followingAuthor ? "Following" : "+ Follow"}
              </button>
            ) : null}
          </div>
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
        <h3 className="mt-3 px-4 text-sm font-semibold wrap-break-word text-foreground">
          {post.title}
        </h3>
      ) : null}

      {post.content ? (
        <p className="mt-2 px-4 text-sm wrap-break-word whitespace-pre-wrap text-foreground/90">
          {post.content}
        </p>
      ) : null}

      <div className="mt-3 px-0.5">
        <MediaGrid urls={post.mediaUrls} />
      </div>

      {!isOwnPost ? (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={onConnect}
            disabled={connectPending}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
              post.inquired
                ? "border border-brand/30 bg-brand-soft text-brand"
                : "bg-brand text-white hover:bg-brand-hover",
            )}
          >
            {post.inquired ? (
              <>
                <Icon name="check" width={16} height={16} strokeWidth={3} />
                Interested
              </>
            ) : (
              <>
                <Icon name="message" width={16} height={16} />
                Connect
              </>
            )}
          </button>
        </div>
      ) : null}

      <Stats
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        inquiryCount={post.inquiryCount}
        ownPost={isOwnPost}
      />

      <div className="grid grid-cols-4 border-t border-surface-border">
        <Action
          icon="heart"
          label={post.liked ? "Liked" : "Like"}
          active={post.liked}
          onClick={() => like({ id: post.id, liked: post.liked })}
        />
        <Action
          icon="comment"
          label="Comment"
          onClick={() => setCommentsOpen(true)}
        />
        <Action icon="share" label="Share" onClick={onShare} />
        <Action
          icon="bookmark"
          label={post.saved ? "Saved" : "Save"}
          active={post.saved}
          onClick={() => save({ id: post.id, saved: post.saved })}
        />
      </div>

      <PostCommentsModal
        postId={post.id}
        postOwnerId={authorId ?? ""}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </Card>
  );
}

function Stats({
  likeCount,
  commentCount,
  inquiryCount,
  ownPost,
}: {
  likeCount: number;
  commentCount: number;
  inquiryCount: number;
  ownPost: boolean;
}) {
  if (likeCount === 0 && commentCount === 0 && (!ownPost || inquiryCount === 0)) {
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
      <span className="inline-flex items-center gap-3">
        {ownPost && inquiryCount > 0 ? (
          <span>
            {inquiryCount} {inquiryCount === 1 ? "lead" : "leads"}
          </span>
        ) : null}
        {commentCount > 0 ? <span>{commentCount} comments</span> : null}
      </span>
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
