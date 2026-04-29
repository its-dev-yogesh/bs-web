"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSuggestedUsers } from "@/hooks/queries/useSuggestedUsers";
import { useSendDm } from "@/hooks/mutations/useSendDm";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { StoryOverlay } from "@/components/sections/StoryOverlay";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { appRoutes } from "@/config/routes/app.routes";
import { uiActions } from "@/store/actions/ui.actions";
import { uploadService } from "@/services/upload.service";
import {
  STORIES_STORAGE_KEY,
  detectMediaType,
  getStoredStories,
  isStoryActive,
  type Story,
  type StoryMediaType,
} from "@/lib/stories";


function toStoryLabel(name: string) {
  const cleaned = name.replace(/^seed_/i, "").replace(/_/g, " ").trim();
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ConnectionsRail() {
  const router = useRouter();
  const user = useAppStore(selectUser);
  const meId = String(user?._id ?? user?.id ?? "").trim();
  const isLoggedIn = Boolean(meId);
  const { data: users, isLoading } = useSuggestedUsers(12);
  const { mutate: sendDm, isPending: sendingDm } = useSendDm();
  const [sessionStartTs] = useState(() => Date.now());
  const [customStories, setCustomStories] = useState<Story[]>(() =>
    getStoredStories(),
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);
  const [viewerStoryIndex, setViewerStoryIndex] = useState(0);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmBody, setDmBody] = useState("");

  const activeCustomStories = useMemo(
    () => customStories.filter((story) => isStoryActive(story)),
    [customStories],
  );

  useEffect(() => {
    window.localStorage.setItem(
      STORIES_STORAGE_KEY,
      JSON.stringify(activeCustomStories),
    );
  }, [activeCustomStories]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCustomStories((prev) =>
        prev.filter((story) => isStoryActive(story)),
      );
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const suggestedStories = useMemo<Story[]>(() => [], []);

  const stories = useMemo(
    () => [...activeCustomStories],
    [activeCustomStories],
  );

  /** WhatsApp-style: group stories by user; each rail item is one user with all their stories. */
  const userGroups = useMemo<Story[][]>(() => {
    const map = new Map<string, Story[]>();
    for (const s of stories) {
      const key = s.userId ?? `u:${s.username}`;
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      );
    }
    return Array.from(map.values());
  }, [stories]);

  const activeGroup =
    viewerGroupIndex === null || viewerGroupIndex >= userGroups.length
      ? null
      : userGroups[viewerGroupIndex];
  const activeStory =
    activeGroup && viewerStoryIndex < activeGroup.length
      ? activeGroup[viewerStoryIndex]
      : null;

  const openGroup = (idx: number) => {
    setViewerGroupIndex(idx);
    setViewerStoryIndex(0);
  };
  const closeViewer = () => {
    setViewerGroupIndex(null);
    setViewerStoryIndex(0);
  };

  const createStory = (input: {
    content: string;
    mediaUrl?: string;
    mediaType?: StoryMediaType;
  }) => {
    const name = user?.name ?? user?.username ?? "You";
    const username = user?.username ?? "you";
    const newStory: Story = {
      id: `custom-${Date.now()}`,
      userId: meId || undefined,
      name,
      username,
      avatarUrl: user?.avatarUrl,
      content: input.content,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaUrl
        ? (input.mediaType ?? detectMediaType(input.mediaUrl))
        : undefined,
      createdAt: new Date().toISOString(),
    };
    setCustomStories((prev) => [newStory, ...prev]);
    setComposerOpen(false);
  };

  const isOwnStory = Boolean(
    activeStory?.userId && meId && activeStory.userId === meId,
  );

  const handleViewProfile = () => {
    if (!activeStory) return;
    closeViewer();
    router.push(appRoutes.profile(activeStory.username));
  };

  const handleOpenDm = () => {
    if (!activeStory) return;
    if (!isLoggedIn) {
      router.push(appRoutes.login);
      return;
    }
    if (!activeStory.userId) {
      uiActions.error("Can't message", "Broker id unavailable.");
      return;
    }
    const snippet = activeStory.content.trim().slice(0, 140);
    setDmBody(
      `Hi @${activeStory.username},\n\nRegarding your story${
        snippet ? `: "${snippet}"` : ""
      }\n\n`,
    );
    setDmOpen(true);
  };

  const handleSendDm = () => {
    if (!activeStory?.userId) {
      uiActions.error("Can't message", "Broker id unavailable.");
      return;
    }
    sendDm(
      { targetUserId: activeStory.userId, body: dmBody },
      {
        onSuccess: ({ threadId }) => {
          setDmOpen(false);
          closeViewer();
          router.push(appRoutes.thread(threadId));
        },
      },
    );
  };

  return (
    <div className="bg-surface md:rounded-xl md:shadow-sm md:border md:border-surface-border">
      <div className="flex gap-4 overflow-x-auto px-4 py-4 hide-scrollbar">
        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn) {
              router.push(appRoutes.login);
              return;
            }
            setComposerOpen(true);
          }}
          className="flex w-18 shrink-0 flex-col items-center gap-1.5 text-center relative"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-brand bg-brand-soft text-brand">
            <Plus className="h-5 w-5" />
          </div>
          <span className="line-clamp-1 text-[12px] font-medium text-foreground">
            Add
          </span>
        </button>

        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <RailSkeleton key={i} />)
          : userGroups.map((group, idx) => {
              const head = group[0];
              const label = toStoryLabel(head.name);
              const groupKey = head.userId ?? `u:${head.username}`;
              return (
                <button
                  type="button"
                  key={groupKey}
                  onClick={() => openGroup(idx)}
                  className="flex w-18 shrink-0 flex-col items-center gap-2 text-center"
                  aria-label={`View ${label}'s ${
                    group.length > 1 ? `${group.length} stories` : "story"
                  }`}
                >
                  <span className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400">
                    <Avatar
                      src={head.avatarUrl}
                      name={label}
                      size="lg"
                      className="h-13! w-13! ring-2 ring-surface"
                    />
                  </span>
                  <span className="block w-full truncate px-1 text-[12px] font-medium text-foreground">
                    {label}
                  </span>
                </button>
              );
            })}
      </div>
      <Modal open={composerOpen} onClose={() => setComposerOpen(false)} title="Add Story">
        <StoryComposer onSubmit={createStory} />
      </Modal>
      {activeGroup && activeStory ? (
        <StoryOverlay
          stories={activeGroup}
          index={viewerStoryIndex}
          isOwnStory={isOwnStory}
          onClose={closeViewer}
          onPrev={() =>
            setViewerStoryIndex((v) => (v > 0 ? v - 1 : v))
          }
          onNext={() => {
            if (viewerStoryIndex < activeGroup.length - 1) {
              setViewerStoryIndex((v) => v + 1);
              return;
            }
            /** Last story in group → advance to the next user, else close. */
            setViewerGroupIndex((g) => {
              if (g === null) return g;
              if (g < userGroups.length - 1) {
                setViewerStoryIndex(0);
                return g + 1;
              }
              setViewerStoryIndex(0);
              return null;
            });
          }}
          onViewProfile={handleViewProfile}
          onMessage={handleOpenDm}
          onDelete={(target) => {
            setCustomStories((prev) =>
              prev.filter((s) => s.id !== target.id),
            );
            closeViewer();
            uiActions.success("Story deleted");
          }}
        />
      ) : null}
      <Modal
        open={dmOpen}
        onClose={() => setDmOpen(false)}
        title="Message broker"
        mobilePosition="center"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sends an in-app message about this story.
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
            <Button
              type="button"
              loading={sendingDm}
              disabled={!dmBody.trim()}
              onClick={handleSendDm}
            >
              Send message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5">
      <span className="h-14 w-14 animate-pulse rounded-full bg-surface-muted" />
      <span className="h-2 w-12 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}


function StoryComposer({
  onSubmit,
}: {
  onSubmit: (input: {
    content: string;
    mediaUrl?: string;
    mediaType?: StoryMediaType;
  }) => void;
}) {
  const [content, setContent] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<StoryMediaType | null>(null);
  const [uploading, setUploading] = useState(false);
  const canSubmit = content.trim().length > 0 && !uploading;

  const clearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  const handleFilePick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const uploaded = await uploadService.uploadMixed([file], "stories");
      const first =
        uploaded.images?.[0] ??
        uploaded.videos?.[0] ??
        uploaded.documents?.[0];
      if (!first?.url) {
        throw new Error("Upload returned no URL.");
      }
      const mime = file.type.toLowerCase();
      const detected: StoryMediaType = mime.startsWith("video/")
        ? "video"
        : mime.startsWith("image/")
          ? "image"
          : "document";
      setMediaUrl(first.url);
      setMediaType(detected);
      uiActions.success("File uploaded");
    } catch (err) {
      uiActions.error(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    const next = mediaUrlInput.trim();
    if (!next) return;
    try {
      new URL(next);
    } catch {
      uiActions.error("Invalid URL", "Please enter a valid URL.");
      return;
    }
    setMediaUrl(next);
    setMediaType(detectMediaType(next));
    setMediaUrlInput("");
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          content: content.trim(),
          mediaUrl: mediaUrl ?? undefined,
          mediaType: mediaType ?? undefined,
        });
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a quick broker update for your story..."
        rows={4}
        className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
      />
      <div className="rounded-xl border border-dashed border-surface-border p-3">
        <label className="text-xs font-semibold text-muted-foreground">
          Upload image, video, or PDF
        </label>
        <input
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          disabled={uploading}
          onChange={(e) => {
            void handleFilePick(e.target.files);
            e.currentTarget.value = "";
          }}
          className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
        />
        {uploading ? (
          <p className="mt-2 text-[11px] text-muted-foreground">Uploading…</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={mediaUrlInput}
          onChange={(e) => setMediaUrlInput(e.target.value)}
          placeholder="Or paste a media URL (https://...)"
          className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
        />
        <Button type="button" variant="outline" onClick={applyUrl}>
          Use
        </Button>
      </div>
      {mediaUrl ? (
        <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-3 py-2">
          <span className="truncate text-xs text-muted-foreground">
            {mediaType === "video"
              ? "Video"
              : mediaType === "document"
                ? "Document"
                : "Image"}{" "}
            · {mediaUrl}
          </span>
          <button
            type="button"
            onClick={clearMedia}
            className="text-xs font-semibold text-danger hover:underline"
          >
            Remove
          </button>
        </div>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Post story
        </button>
      </div>
    </form>
  );
}
