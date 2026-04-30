import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import { ApiError } from "@/lib/api-error";
import type { Story, StoryMediaType } from "@/lib/stories";

type RawStory = {
  id?: string;
  _id?: string;
  userId?: string;
  user_id?: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  content?: string;
  mediaUrl?: string;
  media_url?: string;
  mediaType?: StoryMediaType;
  media_type?: StoryMediaType;
  createdAt?: string;
};

function mapStory(raw: RawStory): Story {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    userId: raw.userId ?? raw.user_id,
    name: raw.name ?? raw.username ?? "Broker",
    username: raw.username ?? "",
    avatarUrl: raw.avatarUrl ?? raw.avatar_url,
    content: raw.content ?? "",
    mediaUrl: raw.mediaUrl ?? raw.media_url,
    mediaType: raw.mediaType ?? raw.media_type,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export const storyService = {
  async listFeed(): Promise<Story[]> {
    try {
      const { data } = await api.get<{ data: RawStory[] }>(apiRoutes.stories.feed);
      const items = Array.isArray(data?.data) ? data.data : [];
      return items.map(mapStory);
    } catch (error) {
      /** Guest/expired token: empty rail is fine. Real errors should surface
       *  so React Query can retry and the user can see why nothing loaded. */
      if (error instanceof ApiError && error.isUnauthorized) {
        return [];
      }
      throw error;
    }
  },

  async create(input: {
    content: string;
    mediaUrl?: string;
    mediaType?: StoryMediaType;
  }): Promise<Story | null> {
    const { data } = await api.post<{ data: RawStory }>(apiRoutes.stories.create, {
      content: input.content,
      media_url: input.mediaUrl,
      media_type: input.mediaType,
    });
    return data?.data ? mapStory(data.data) : null;
  },

  async remove(id: string): Promise<void> {
    await api.delete(apiRoutes.stories.byId(id));
  },
};
