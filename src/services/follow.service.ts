import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";

export type FollowStatus = {
  is_following: boolean;
  followers_count: number;
  following_count: number;
};

export const followService = {
  async follow(userId: string): Promise<void> {
    await api.post(apiRoutes.follows.follow(userId));
  },

  async unfollow(userId: string): Promise<void> {
    await api.delete(apiRoutes.follows.follow(userId));
  },

  async status(userId: string): Promise<FollowStatus> {
    const { data } = await api.get<FollowStatus>(
      apiRoutes.follows.status(userId),
    );
    return data;
  },
};
