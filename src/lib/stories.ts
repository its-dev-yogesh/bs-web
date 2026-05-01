export const STORIES_STORAGE_KEY = "bs.custom_stories";
export const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export type StoryMediaType = "image" | "video" | "document";

export type StoryViewer = {
  userId: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  viewedAt: string;
  liked?: boolean;
  likedAt?: string;
};

export type Story = {
  id: string;
  userId?: string;
  name: string;
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: StoryMediaType;
  /** @deprecated kept for legacy localStorage entries — read once, then promoted to mediaUrl. */
  imageUrl?: string;
  createdAt: string;
  /** Instagram-style engagement. Owner sees the full list; non-owners only
   *  toggle their own `liked` flag. */
  viewers?: StoryViewer[];
};

export function detectMediaType(url: string): StoryMediaType {
  const lower = url.toLowerCase().split("?")[0];
  if (/\.(mp4|mov|webm|mkv|avi|m4v)$/.test(lower)) return "video";
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/.test(lower)) return "document";
  return "image";
}

export function isStoryActive(story: Story, now = Date.now()) {
  const created = Date.parse(story.createdAt);
  if (Number.isNaN(created)) return false;
  return now - created < STORY_TTL_MS;
}

export function normalizeStory(story: Story): Story {
  if (story.mediaUrl) {
    return {
      ...story,
      mediaType: story.mediaType ?? detectMediaType(story.mediaUrl),
    };
  }
  if (story.imageUrl) {
    return {
      ...story,
      mediaUrl: story.imageUrl,
      mediaType: story.mediaType ?? detectMediaType(story.imageUrl),
    };
  }
  return story;
}

export function getStoredStories(): Story[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORIES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Story[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((story) => isStoryActive(story))
      .map((story) => normalizeStory(story));
  } catch {
    return [];
  }
}

export function getStoredStoriesByUserId(userId: string): Story[] {
  const id = userId.trim();
  if (!id) return [];
  return getStoredStories().filter((story) => story.userId === id);
}

function readRawStored(): Story[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORIES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Story[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(stories: Story[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
  // Notify other tabs/components watching this key.
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: STORIES_STORAGE_KEY,
      newValue: JSON.stringify(stories),
    }),
  );
}

/** Append a story (newest first) and prune entries older than the TTL. */
export function addStoredStory(story: Story): Story {
  const normalized = normalizeStory(story);
  const fresh = readRawStored().filter((s) => isStoryActive(s));
  writeStored([normalized, ...fresh]);
  return normalized;
}

export function removeStoredStory(id: string): void {
  const next = readRawStored().filter((s) => s.id !== id);
  writeStored(next);
}

function updateStoredStory(
  id: string,
  patch: (story: Story) => Story | null,
): Story | null {
  const all = readRawStored();
  let updated: Story | null = null;
  const next = all.map((s) => {
    if (s.id !== id) return s;
    const result = patch(s);
    if (!result) return s;
    updated = result;
    return result;
  });
  writeStored(next);
  return updated;
}

/** Idempotent: a viewer who's seen the story before keeps their original
 *  viewedAt, and a `liked` flag set elsewhere isn't clobbered. */
export function recordStoryView(
  storyId: string,
  viewer: {
    userId: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
  },
): Story | null {
  if (!viewer.userId) return null;
  return updateStoredStory(storyId, (story) => {
    // Owner viewing their own story shouldn't count.
    if (story.userId && story.userId === viewer.userId) return null;
    const existing = story.viewers ?? [];
    const already = existing.find((v) => v.userId === viewer.userId);
    if (already) {
      // Refresh display fields so the sheet shows the current avatar/name.
      const refreshed: StoryViewer = {
        ...already,
        name: viewer.name ?? already.name,
        username: viewer.username ?? already.username,
        avatarUrl: viewer.avatarUrl ?? already.avatarUrl,
      };
      return {
        ...story,
        viewers: existing.map((v) =>
          v.userId === viewer.userId ? refreshed : v,
        ),
      };
    }
    const next: StoryViewer = {
      userId: viewer.userId,
      name: viewer.name,
      username: viewer.username,
      avatarUrl: viewer.avatarUrl,
      viewedAt: new Date().toISOString(),
    };
    return { ...story, viewers: [...existing, next] };
  });
}

/** Toggle the viewer's like on a story. Returns the new liked state, or
 *  `null` if the story isn't found. Records a view if missing so likers
 *  always show in the viewers sheet. */
export function toggleStoryLike(
  storyId: string,
  viewer: {
    userId: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
  },
): boolean | null {
  if (!viewer.userId) return null;
  let nextState: boolean | null = null;
  updateStoredStory(storyId, (story) => {
    if (story.userId && story.userId === viewer.userId) return null;
    const list = story.viewers ?? [];
    const idx = list.findIndex((v) => v.userId === viewer.userId);
    let nextList: StoryViewer[];
    if (idx === -1) {
      nextState = true;
      nextList = [
        ...list,
        {
          userId: viewer.userId,
          name: viewer.name,
          username: viewer.username,
          avatarUrl: viewer.avatarUrl,
          viewedAt: new Date().toISOString(),
          liked: true,
          likedAt: new Date().toISOString(),
        },
      ];
    } else {
      const current = list[idx];
      const nowLiked = !current.liked;
      nextState = nowLiked;
      nextList = list.map((v, i) =>
        i === idx
          ? {
              ...v,
              liked: nowLiked,
              likedAt: nowLiked ? new Date().toISOString() : undefined,
            }
          : v,
      );
    }
    return { ...story, viewers: nextList };
  });
  return nextState;
}

export function getStoryViewers(storyId: string): StoryViewer[] {
  const story = readRawStored().find((s) => s.id === storyId);
  return story?.viewers ?? [];
}

export function getStoredStoryById(storyId: string): Story | null {
  return readRawStored().find((s) => s.id === storyId) ?? null;
}

export function getStoryViewCount(story: Story): number {
  return story.viewers?.length ?? 0;
}

export function getStoryLikeCount(story: Story): number {
  return (story.viewers ?? []).filter((v) => v.liked).length;
}

export function isStoryLikedBy(story: Story, userId: string): boolean {
  if (!userId) return false;
  return Boolean(story.viewers?.find((v) => v.userId === userId)?.liked);
}

export function formatStoryRelative(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
