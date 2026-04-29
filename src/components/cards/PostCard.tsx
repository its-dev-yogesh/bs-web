"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar/Avatar";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  Forward,
  FileText,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card/Card";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { useDeletePost, useUpdatePost } from "@/hooks/mutations/usePostActions";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/date";
import { MediaGrid } from "./MediaGrid";
import type { Post } from "@/types";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { usePostComments } from "@/hooks/queries/usePostComments";
import { useCreateComment } from "@/hooks/mutations/useCreateComment";
import { useCommentLike } from "@/hooks/mutations/useCommentLike";
import { useDeleteComment } from "@/hooks/mutations/useDeleteComment";
import { PostCommentSection } from "./PostCommentSection";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";
import { useSendDm } from "@/hooks/mutations/useSendDm";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { shareBrokerPost } from "@/lib/share-post";
import { uiActions } from "@/store/actions/ui.actions";
import {
  ANONYMOUS_AUTHOR_LABEL,
  isResolvableProfileUsername,
} from "@/lib/author-display";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";

const MENTION_RE = /@([a-zA-Z0-9_]{3,30})/g;

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore(selectUser);
  const myId = user?._id ?? user?.id;
  const isLoggedIn = Boolean(myId);
  const { mutate: like } = useLikePost();
  const { mutate: updatePost, isPending: savingPost } = useUpdatePost();
  const { mutate: deletePost, isPending: deletingPost } = useDeletePost();
  const { mutateAsync: createCommentAsync, isPending: postingComment } =
    useCreateComment(post.id);
  const { mutate: likeComment, isPending: likePending } = useCommentLike(post.id);
  const { mutate: deleteComment, isPending: deletingComment } = useDeleteComment(post.id);
  const { mutate: sendDm, isPending: sendingDm } = useSendDm();

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [dmOpen, setDmOpen] = useState(false);
  const [dmBody, setDmBody] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editWhatsapp, setEditWhatsapp] = useState(post.whatsappNumber ?? "");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: comments = [], isLoading: loadingComments } = usePostComments(
    post.id,
    commentsOpen,
  );

  const typeLabel =
    post.type === "requirement" ? "Client Requirement" : "Property Listing";
  const authorId = post.author.id;
  const isOwnPost = Boolean(myId && authorId && myId === authorId);
  const shouldResolveAuthor = !isOwnPost && Boolean(authorId);
  const { data: resolvedAuthor } = useQuery({
    queryKey: queryKeys.profile.byUsername(authorId ?? ""),
    queryFn: async () => userService.getById(authorId!),
    enabled: shouldResolveAuthor,
    staleTime: 5 * 60 * 1000,
  });
  const fallbackAuthorName =
    post.author.name === ANONYMOUS_AUTHOR_LABEL ? undefined : post.author.name;
  /** Feed items only have a synthetic author label; use session for your own posts. */
  const displayName = isOwnPost
    ? (user?.name ?? user?.username ?? post.author.name ?? post.author.username)
    : (resolvedAuthor?.name ??
      resolvedAuthor?.username ??
      fallbackAuthorName ??
      post.author.username ??
      "Broker");
  const avatarSrc = isOwnPost
    ? (user?.avatarUrl ?? post.author.avatarUrl)
    : (resolvedAuthor?.avatarUrl ?? post.author.avatarUrl);
  const subline = isOwnPost
    ? (user?.headline ?? post.author.headline)
    : (resolvedAuthor?.headline ?? post.author.headline);
  const profileSlug = isOwnPost
    ? (user?.username ?? post.author.username)
    : (resolvedAuthor?.username ?? post.author.username);
  const hasPublicUsername = isResolvableProfileUsername(profileSlug);
  const profileHref = hasPublicUsername
    ? appRoutes.profile(String(profileSlug).trim())
    : authorId
      ? appRoutes.profile(authorId)
      : "#";

  const requireLogin = () => router.push(appRoutes.login);

  const handleRefer = async () => {
    const result = await shareBrokerPost({
      postId: post.id,
      title: post.title,
      excerpt: post.content.slice(0, 280),
    });
    if (result === "copied") {
      uiActions.success("Link copied");
    }
  };

  const handleSendDm = () => {
    if (!authorId) {
      uiActions.error("Can't message", "Author unavailable.");
      return;
    }
    sendDm(
      { targetUserId: authorId, body: dmBody },
      {
        onSuccess: ({ threadId }) => {
          setDmOpen(false);
          router.push(appRoutes.thread(threadId));
        },
      },
    );
  };

  const openDmComposer = () => {
    const subject = post.title ?? post.content.slice(0, 80);
    setDmBody(`Regarding "${subject}":\n\n`);
    setDmOpen(true);
  };

  const handleOpenEdit = () => {
    setEditTitle(post.title ?? "");
    setEditContent(post.content ?? "");
    setEditWhatsapp(post.whatsappNumber ?? "");
    setMenuOpen(false);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    const title = editTitle.trim();
    const description = editContent.trim();
    if (!title && !description) {
      uiActions.error("Edit post", "Title or content is required.");
      return;
    }
    updatePost(
      {
        id: post.id,
        title: title || undefined,
        description: description || undefined,
        whatsapp_number: editWhatsapp.trim() || undefined,
      },
      {
        onSuccess: () => setEditOpen(false),
      },
    );
  };

  const handleDeletePost = () => {
    deletePost(post.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        if (pathname?.includes(`/listings/${post.id}`)) {
          router.replace(appRoutes.listings);
        }
      },
    });
  };

  const submitComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    void createCommentAsync({ content: text })
      .then(() => setCommentDraft(""))
      .catch(() => {
        /* toast from useCreateComment */
      });
  };

  const handleReply = async (parentId: string, content: string) => {
    await createCommentAsync({ content, parentId });
  };

  const handleCommentLike = (commentId: string, currentlyLiked: boolean) => {
    likeComment({ commentId, liked: currentlyLiked });
  };

  const handleCommentDelete = (commentId: string) => {
    deleteComment(commentId);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const waText = encodeURIComponent(
    `I'm interested in this ${post.type === "requirement" ? "requirement" : "listing"}: ${post.title ?? post.content}`,
  );
  const waDigits = String(post.whatsappNumber ?? "").replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${waText}`
    : `https://wa.me/?text=${waText}`;
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
    <Card className="rounded-[16px] shadow-sm mb-4 border-0">
      <div className="px-4 pt-3 pb-1 border-b border-surface-border/50">
        <span className="text-[12px] font-semibold text-foreground">Broker activity update</span>
      </div>

      <header className="flex items-start gap-3 px-4 pt-3">
        <Link
          href={profileHref}
          onClick={(e) => {
            if (!hasPublicUsername && !authorId) e.preventDefault();
          }}
        >
          <Avatar
            src={avatarSrc}
            name={displayName}
            size="md"
            className="!w-10 !h-10"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            onClick={(e) => {
              if (!hasPublicUsername && !authorId) e.preventDefault();
            }}
            className="block truncate text-[14px] font-bold text-foreground"
          >
            {displayName}
          </Link>
          {subline ? (
            <p className="truncate text-[12px] text-muted-foreground font-medium">
              {subline}
            </p>
          ) : null}
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
            {formatRelative(post.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwnPost ? (
            <span className="rounded-full border border-surface-border px-3 py-1 text-[12px] font-semibold text-muted-foreground">
              Your post
            </span>
          ) : authorId ? (
            <FollowOrConnectButton
              targetUserId={authorId}
              variant="brandOutline"
              label="+ Follow"
              serverConnected={post.authorConnection?.connected}
              serverPendingOutgoing={post.authorConnection?.pendingOutgoing}
              serverPendingIncoming={post.authorConnection?.pendingIncoming}
            />
          ) : null}
          <div className="relative" ref={menuRef}>
            <button
              aria-label="More"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full p-1 text-muted-foreground hover:bg-surface-muted"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-surface-border bg-surface p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    void handleRefer();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-foreground hover:bg-surface-muted"
                >
                  <Forward className="h-4 w-4" />
                  Share post
                </button>
                {isOwnPost ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-foreground hover:bg-surface-muted"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-danger hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete post
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {post.title ? (
        <div className="mt-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
              {typeLabel}
            </span>
            <Link
              href={appRoutes.listingDetail(post.id)}
              className="text-[11px] font-bold text-brand hover:underline"
            >
              View full post
            </Link>
          </div>
          <h3 className="mt-2 text-[13px] font-medium text-foreground">{post.title}</h3>
        </div>
      ) : (
        <div className="mt-3 px-4">
          <Link
            href={appRoutes.listingDetail(post.id)}
            className="text-[11px] font-bold text-brand hover:underline"
          >
            View full post
          </Link>
        </div>
      )}

      {post.content ? (
        <p className="mt-2 px-4 text-[13px] whitespace-pre-wrap text-foreground font-medium">
          {renderMentions(post.content)}
        </p>
      ) : null}

      {post.mediaUrls.length > 0 ? (
        <div className="mt-3 px-4 pb-2">
          <div className="rounded-2xl overflow-hidden">
            <MediaGrid urls={post.mediaUrls} />
          </div>
        </div>
      ) : null}
      {(post.mediaItems ?? []).some((m) => m.type !== "image") ? (
        <div className="mt-2 px-4 pb-2 flex flex-wrap gap-2">
          {(post.mediaItems ?? [])
            .filter((m) => m.type !== "image")
            .map((m, idx) => (
              <a
                key={`${m.url}-${idx}`}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-surface-border px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
              >
                {m.type === "video" ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                {m.type === "video" ? "Video" : "Document"}
              </a>
            ))}
        </div>
      ) : null}

      <Stats post={post} />

      <div className="flex justify-between px-2 py-1 border-t border-surface-border/50">
        <Action
          icon={ThumbsUp}
          label="Interested"
          active={post.liked}
          onClick={() => (isLoggedIn ? like({ id: post.id, liked: post.liked }) : requireLogin())}
        />
        <Action
          icon={MessageSquare}
          label="Comment"
          active={commentsOpen}
          onClick={() => {
            if (!isLoggedIn) {
              requireLogin();
              return;
            }
            setCommentsOpen((v) => !v);
          }}
        />
        <Action
          icon={Share2}
          label="Share"
          onClick={() => {
            void handleRefer();
          }}
        />
        <Action
          icon={Send}
          label="Send"
          onClick={() => {
            if (!isLoggedIn) {
              requireLogin();
              return;
            }
            if (isOwnPost) {
              uiActions.error("Messaging", "This is your own post.");
              return;
            }
            openDmComposer();
          }}
        />
      </div>

      {commentsOpen ? (
        <div className="border-t border-surface-border/50 px-4 py-3 space-y-3 bg-surface-muted/30">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground">Loading comments…</p>
          ) : (
            <PostCommentSection
              comments={comments}
              myId={myId}
              isLoggedIn={isLoggedIn}
              requireLogin={requireLogin}
              commentDraft={commentDraft}
              setCommentDraft={setCommentDraft}
              onSubmitTop={submitComment}
              postingTop={postingComment}
              onLike={handleCommentLike}
              onDelete={handleCommentDelete}
              onReply={handleReply}
              postingReply={postingComment}
              likePending={likePending}
              deletingComment={deletingComment}
            />
          )}
        </div>
      ) : null}

      <div className="px-4 pb-4">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex rounded-full border border-green-600 px-3 py-1 text-[12px] font-bold text-green-700 hover:bg-green-50"
        >
          WhatsApp enquiry
        </a>
      </div>

      <Modal open={dmOpen} onClose={() => setDmOpen(false)} title="Message broker" mobilePosition="center">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sends an in-app message to the listing owner about this post.
          </p>
          <textarea
            value={dmBody}
            onChange={(e) => setDmBody(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDmOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <Button type="button" loading={sendingDm} disabled={!dmBody.trim()} onClick={handleSendDm}>
              Send message
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit post"
        mobilePosition="center"
      >
        <div className="space-y-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Post title"
            className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            placeholder="Post details"
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand"
          />
          <input
            value={editWhatsapp}
            onChange={(e) => setEditWhatsapp(e.target.value.replace(/\D/g, ""))}
            placeholder="WhatsApp number (with country code)"
            className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <Button type="button" loading={savingPost} onClick={handleSaveEdit}>
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete post?"
        mobilePosition="center"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This removes the post from feed and profile. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="danger"
              loading={deletingPost}
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function Stats({ post }: { post: Post }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-1 text-[11px] text-muted-foreground font-medium">
      <span>{post.likeCount} brokers interested</span>
      <span>{post.commentCount} responses</span>
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 py-2 px-4 text-[12px] font-semibold transition rounded-lg",
        active
          ? "text-brand"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon className="w-[20px] h-[20px]" strokeWidth={1.5} />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
