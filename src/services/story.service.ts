import {
  addStoredStory,
  detectMediaType,
  getStoredStories,
  isStoryActive,
  removeStoredStory,
  type Story,
  type StoryMediaType,
} from "@/lib/stories";
import { useAppStore } from "@/store/main.store";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `story_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Stories were never ported from bs-backend to chanakya-astra-service.
 * Until a backend exists, persist stories in localStorage so the rail and
 * profile views (which already read from localStorage) work end-to-end.
 */
export const storyService = {
  async listFeed(): Promise<Story[]> {
    return getStoredStories().filter((s) => isStoryActive(s));
  },

  async create(input: {
    content: string;
    mediaUrl?: string;
    mediaType?: StoryMediaType;
  }): Promise<Story> {
    const user = useAppStore.getState().user;
    const userId = String(user?._id ?? user?.id ?? "");
    if (!userId) {
      throw new Error("You must be signed in to post a story.");
    }
    const story: Story = {
      id: makeId(),
      userId,
      name: user?.name ?? user?.username ?? "Broker",
      username: user?.username ?? "",
      avatarUrl: user?.avatarUrl,
      content: input.content,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaUrl
        ? (input.mediaType ?? detectMediaType(input.mediaUrl))
        : undefined,
      createdAt: new Date().toISOString(),
    };
    return addStoredStory(story);
  },

  async remove(id: string): Promise<void> {
    removeStoredStory(id);
  },
};
