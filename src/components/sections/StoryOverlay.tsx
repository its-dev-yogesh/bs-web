"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  MessageSquare,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import {
  formatStoryRelative,
  getStoredStoryById,
  getStoryLikeCount,
  getStoryViewCount,
  isStoryLikedBy,
  recordStoryView,
  toggleStoryLike,
  type Story,
} from "@/lib/stories";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { StoryViewersSheet } from "./StoryViewersSheet";

const STORY_DEFAULT_DURATION_MS = 5000;

/** Deterministic gradient for text-only stories so each post keeps its identity. */
const TEXT_STORY_GRADIENTS = [
  "from-fuchsia-500 via-pink-500 to-orange-400",
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-slate-700 via-slate-800 to-black",
];

function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TEXT_STORY_GRADIENTS[Math.abs(h) % TEXT_STORY_GRADIENTS.length];
}

export function StoryOverlay({
  stories,
  index,
  isOwnStory,
  onClose,
  onPrev,
  onNext,
  onViewProfile,
  onMessage,
  onDelete,
}: {
  stories: Story[];
  index: number;
  isOwnStory: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewProfile?: () => void;
  onMessage?: () => void;
  onDelete?: (story: Story) => void;
}) {
  const story = stories[index];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  /** Bumps every time the local story changes so view/like counts re-read
   *  from the latest localStorage entry. */
  const [engagementTick, setEngagementTick] = useState(0);
  const isVideo = story?.mediaType === "video";

  const viewer = useAppStore(selectUser);
  const viewerId = String(viewer?._id ?? viewer?.id ?? "");

  /** Read the persisted version after each view/like — `stories` prop is a
   *  stale snapshot from the parent. */
  const liveStory = useMemo<Story | undefined>(() => {
    if (!story) return story;
    void engagementTick;
    return getStoredStoryById(story.id) ?? story;
  }, [story, engagementTick]);

  /** Auto-record a view when a non-own story comes into focus. Skip if the
   *  viewer is the story author or not signed in. */
  useEffect(() => {
    if (!story || isOwnStory || !viewerId) return;
    if (story.userId === viewerId) return;
    recordStoryView(story.id, {
      userId: viewerId,
      name: viewer?.name,
      username: viewer?.username,
      avatarUrl: viewer?.avatarUrl,
    });
    setEngagementTick((t) => t + 1);
  }, [story, isOwnStory, viewerId, viewer?.name, viewer?.username, viewer?.avatarUrl]);

  /** Pause auto-advance when the viewers sheet is open. */
  useEffect(() => {
    if (viewersOpen) setPaused(true);
  }, [viewersOpen]);

  const liked = liveStory ? isStoryLikedBy(liveStory, viewerId) : false;
  const viewCount = liveStory ? getStoryViewCount(liveStory) : 0;
  const likeCount = liveStory ? getStoryLikeCount(liveStory) : 0;

  const handleToggleLike = () => {
    if (!story || !viewerId) return;
    toggleStoryLike(story.id, {
      userId: viewerId,
      name: viewer?.name,
      username: viewer?.username,
      avatarUrl: viewer?.avatarUrl,
    });
    setEngagementTick((t) => t + 1);
  };

  /** Lock body scroll, close on Escape, advance on arrow keys. */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  /** Reset progress + restart auto-advance on each story change. */
  useEffect(() => {
    setProgress(0);
    if (isVideo) return;
    if (paused) return;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(1, (now - startedAt) / STORY_DEFAULT_DURATION_MS);
      setProgress(pct);
      if (pct >= 1) {
        onNext();
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [index, isVideo, onNext, paused]);

  /** Pause/resume video when paused state toggles. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play().catch(() => {});
  }, [paused, index]);

  if (!story) return null;

  const handleZone = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) onPrev();
    else onNext();
  };

  const showActions = !isOwnStory && (onViewProfile || onMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-dvh w-full max-w-120 flex-col overflow-hidden bg-black md:my-4 md:h-[min(900px,90dvh)] md:rounded-2xl md:shadow-2xl">
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-3 pt-3">
          {stories.map((s, i) => {
            const fill = i < index ? 1 : i === index ? progress : 0;
            return (
              <div
                key={s.id}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width: `${fill * 100}%`,
                    transition:
                      i === index && isVideo ? "width 100ms linear" : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 pb-2 pt-6">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={story.avatarUrl}
              name={story.name}
              size="sm"
              className="border border-white/40"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                {story.name}
              </p>
              <p className="truncate text-[11px] text-white/70">
                @{story.username} · {formatStoryRelative(story.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isOwnStory && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this story?")) onDelete(story);
                }}
                aria-label="Delete story"
                className="rounded-full p-1.5 text-white/90 hover:bg-white/10"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close story"
              className="rounded-full p-1.5 text-white/90 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tap zones + media */}
        <div
          className="relative flex-1 cursor-pointer select-none"
          onClick={handleZone}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        >
          {story.mediaUrl ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={story.mediaUrl}
                playsInline
                autoPlay
                muted
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration > 0) setProgress(v.currentTime / v.duration);
                }}
                onEnded={onNext}
                className="h-full w-full bg-black object-contain"
              />
            ) : story.mediaType === "document" ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-900 px-6 text-center">
                <FileText className="h-16 w-16 text-white" />
                <a
                  href={story.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-black"
                >
                  Open document
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.mediaUrl}
                alt={story.name}
                className="h-full w-full bg-black object-contain"
              />
            )
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-linear-to-br ${pickGradient(
                story.id,
              )} px-8`}
            >
              <p className="text-center text-2xl font-bold leading-snug text-white drop-shadow-lg sm:text-3xl whitespace-pre-wrap wrap-break-word">
                {story.content || "No media"}
              </p>
            </div>
          )}

          {/* Desktop chevrons */}
          {stories.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous story"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 md:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next story"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 md:block"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {/* Caption + actions */}
        <div className="absolute bottom-0 left-0 right-0 z-20 space-y-3 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-10">
          {story.content && story.mediaUrl ? (
            <p className="text-[15px] font-semibold leading-snug tracking-tight text-white drop-shadow-md line-clamp-4 whitespace-pre-wrap wrap-break-word">
              {story.content}
            </p>
          ) : null}

          {isOwnStory ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewersOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/60"
            >
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
              {likeCount > 0 ? (
                <>
                  <span className="opacity-50">·</span>
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  <span>{likeCount}</span>
                </>
              ) : null}
            </button>
          ) : null}

          {showActions ? (
            <div className="flex items-center gap-2">
              {onViewProfile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/60 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <UserCircle className="h-4 w-4" />
                  View profile
                </button>
              ) : null}
              {onMessage ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-white/90"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
              ) : null}
              {viewerId ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike();
                  }}
                  aria-label={liked ? "Unlike story" : "Like story"}
                  aria-pressed={liked}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                    liked
                      ? "border-rose-500/80 bg-rose-500/20 text-rose-400"
                      : "border-white/60 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 transition-transform ${liked ? "scale-110 fill-rose-500 text-rose-500" : ""}`}
                  />
                </button>
              ) : null}
            </div>
          ) : viewerId ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLike();
                }}
                aria-label={liked ? "Unlike story" : "Like story"}
                aria-pressed={liked}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                  liked
                    ? "border-rose-500/80 bg-rose-500/20 text-rose-400"
                    : "border-white/60 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-transform ${liked ? "scale-110 fill-rose-500 text-rose-500" : ""}`}
                />
              </button>
            </div>
          ) : null}
        </div>

        {isOwnStory ? (
          <StoryViewersSheet
            open={viewersOpen}
            onClose={() => {
              setViewersOpen(false);
              setPaused(false);
            }}
            viewers={liveStory?.viewers ?? []}
          />
        ) : null}
      </div>
    </div>
  );
}
