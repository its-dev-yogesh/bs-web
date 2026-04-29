export const STORIES_STORAGE_KEY = "bs.custom_stories";
export const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export type StoryMediaType = "image" | "video" | "document";

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
