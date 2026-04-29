"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
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
  Repeat2,
  FileText,
  Video,
  Maximize,
  Bed,
  Bath,
  Bookmark,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card/Card";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { useSavePost } from "@/hooks/mutations/useSavePost";
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
import { ContactButton } from "@/components/connect/ContactButton";
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
  const { mutate: save } = useSavePost();
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


      <header className="flex items-center gap-3 px-4 py-3">
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
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {typeLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatRelative(post.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwnPost ? (
            <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
              Your post
            </span>
          ) : authorId ? (
            <FollowOrConnectButton
              targetUserId={authorId}
              variant="outline"
              className="h-7 px-3 text-[11px] font-bold border-brand text-brand hover:bg-brand-soft"
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
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-surface-border bg-surface p-1 shadow-lg">
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
                {!isOwnPost && post.authorConnection?.connected && (
                  <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-emerald-600 bg-emerald-50/50">
                    <ThumbsUp className="h-4 w-4 fill-emerald-600" />
                    Following
                  </div>
                )}
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

      {/* Media section at top for listing posts */}
      {post.type !== "requirement" && post.mediaUrls.length > 0 && (
        <div className="px-4 pb-2">
          <div className="rounded-2xl overflow-hidden relative group aspect-[3/2]">
            <MediaGrid urls={post.mediaUrls} />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-brand shadow-sm uppercase">
                {post.listing_type === "for_rent" ? "For Rent" : "For Sale"}
              </span>
              {/* <span className="bg-brand/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase">
                Featured
              </span> */}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-2 space-y-2">
        {/* Price / Budget Tag */}
        {post.type === "requirement" ? (
          <div className="text-[20px] font-bold text-brand leading-none">
            {post.budget_min || post.budget_max ? (
              <>
                {post.budget_min ? `₹${post.budget_min.toLocaleString("en-IN")}` : "0"}
                {post.budget_max ? ` - ₹${post.budget_max.toLocaleString("en-IN")}` : "+"}
              </>
            ) : (
              "Budget on request"
            )}
            <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-tighter">Budget</span>
          </div>
        ) : post.price ? (
          <div className="text-[20px] font-bold text-brand leading-none">
            {typeof post.price === "number" ? `₹${post.price.toLocaleString("en-IN")}` : post.price}
          </div>
        ) : (
          <div className="text-[20px] font-bold text-brand leading-none">Price on request</div>
        )}

        {/* Address/Location */}
        <div className="text-[13px] text-muted-foreground font-medium line-clamp-1">
          {post.address || post.locationText || "Location available on request"}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug">
          {post.title || (post.type === "requirement" ? "Property Requirement" : "Modern Property Listing")}
        </h3>

        {/* Project Details / Type / Status */}
        <div className="flex flex-wrap gap-2">
          {post.type === "requirement" && (
            <span className="bg-brand-soft text-brand px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              {post.listing_type === "rent" ? "On Rent" : "To Buy"}
            </span>
          )}
          {post.project_type && (
            <span className="bg-surface-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
              {post.project_type}
            </span>
          )}
          {post.project_status && (
            <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">
              {post.project_status}
            </span>
          )}
        </div>

        {/* Content/Description */}
        {post.content && (
          <p className="text-[13px] text-foreground/80 line-clamp-2 mt-1 font-medium">
            {renderMentions(post.content)}
          </p>
        )}

        {/* Amenities Grid */}
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 ", post.area_sqft || post.config || post.bathrooms ? "border-t border-surface-border/30 mt-3" : "")}>
          {post.area_sqft ? (
            <div className="flex items-center gap-1.5 text-[12px] text-foreground font-semibold">
              <Maximize className="w-4 h-4 text-muted-foreground" />
              <span>{post.area_sqft} sq ft</span>
            </div>
          ) : null}
          {post.config ? (
            <div className="flex items-center gap-1.5 text-[12px] text-foreground font-semibold">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span>{post.config}</span>
            </div>
          ) : null}
          {post.bathrooms ? (
            <div className="flex items-center gap-1.5 text-[12px] text-foreground font-semibold">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span>{post.bathrooms} baths</span>
            </div>
          ) : null}
        </div>

        {/* Amenities List Tags */}
        {post.amenities && post.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[10px] text-muted-foreground bg-surface-muted/50 px-1.5 py-0.5 rounded">
                {a}
              </span>
            ))}
            {post.amenities.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{post.amenities.length - 4} more</span>
            )}
          </div>
        )}

        {/* Listed By */}
        {/* <div className="flex items-center justify-between pt-3">
           <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
             Listed by <span className="text-foreground">{displayName}</span>
           </span>
           <Link
             href={appRoutes.listingDetail(post.id)}
             className="text-[11px] font-bold text-brand hover:underline"
           >
             View full post
           </Link>
        </div> */}
      </div>

      <Stats post={post} />

      <div className="flex items-center justify-between border-t border-surface-border/50 px-2 py-1 ">
        <Action
          icon={ThumbsUp}
          label="Like"
          count={post.likeCount}
          active={post.liked}
          onClick={() => (isLoggedIn ? like({ id: post.id, liked: post.liked }) : requireLogin())}
        />
        <Action
          icon={MessageSquare}
          label="Comment"
          count={post.commentCount}
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
          icon={Repeat2}
          label="Repost"
          onClick={() => {
            if (!isLoggedIn) {
              requireLogin();
              return;
            }
            void handleRefer();
          }}
        />
        <Action
          icon={Bookmark}
          label={post.saved ? "Saved" : "Save"}
          active={post.saved}
          onClick={() => (isLoggedIn ? save({ id: post.id, saved: post.saved }) : requireLogin())}
        />

        <div className="flex-1 flex justify-center">
          <ContactButton
            label="Connect"
            variant="primary"
            onClick={() => {
              if (!isLoggedIn) {
                requireLogin();
                return;
              }
              if (isOwnPost) {
                uiActions.error("Contact", "This is your own post.");
                return;
              }
              setDmOpen(true);
            }}
          />
        </div>
          {/* <div className="flex sm:hidden w-full">
            <Action
              icon={MessageCircle}
              label="Connect"
              onClick={() => {
                if (!isLoggedIn) {
                  requireLogin();
                  return;
                }
                if (isOwnPost) {
                  uiActions.error("Connect", "This is your own post.");
                  return;
                }
                setDmOpen(true);
              }}
            />
          </div> */}
        </div>

      {commentsOpen ? (
        <div className="border-t border-surface-border/50 px-4 py-3 space-y-3 bg-surface-muted/30">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground">Loading comments…</p>
          ) : (
            <PostCommentSection
              comments={comments}
              myId={myId}
              postOwnerId={authorId}
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

      {/* <div className="px-4 pb-4">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex rounded-full border border-green-600 px-3 py-1 text-[12px] font-bold text-green-700 hover:bg-green-50"
        >
          WhatsApp enquiry
        </a>
      </div> */}

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
  const hasStats =
    post.likeCount > 0 ||
    post.commentCount > 0 ||
    (post.repostCount ?? 0) > 0 ||
    (post.saveCount ?? 0) > 0;
  if (!hasStats) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 text-[13px] text-muted-foreground">
      {/* Left: Stacked Reaction Icons + Like Count */}
      <div className="flex items-center">
        {post.likeCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <div className="z-[3] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-blue-500 ring-1 ring-surface">
                <ThumbsUp className="h-[9px] w-[9px] fill-white text-white" />
              </div>
            </div>
            <span className="ml-1 font-medium">{post.likeCount}</span>
          </div>
        )}
      </div>

      {/* Right: Comments, Reposts and Saves */}
      <div className="flex items-center gap-1.5 font-medium">
        {post.commentCount > 0 && (
          <span>
            {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        )}
        {post.commentCount > 0 &&
          ((post.repostCount ?? 0) > 0 || (post.saveCount ?? 0) > 0) && (
            <span>•</span>
          )}
        {(post.repostCount ?? 0) > 0 && (
          <>
            <span>
              {post.repostCount}{" "}
              {post.repostCount === 1 ? "repost" : "reposts"}
            </span>
            {(post.saveCount ?? 0) > 0 && <span>•</span>}
          </>
        )}
        {(post.saveCount ?? 0) > 0 && (
          <span>
            {post.saveCount} {post.saveCount === 1 ? "save" : "saves"}
          </span>
        )}
      </div>
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
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition rounded-lg hover:bg-surface-muted",
        active ? "text-brand" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon 
        className={cn(
          "w-[20px] h-[20px] group-hover:scale-110 transition-all ease-in-out", 
          active && "fill-brand/10 text-brand"
        )} 
        strokeWidth={2} 
      />
      <span className="text-[12px] font-bold">{label}</span>
    </button>
  );
}
