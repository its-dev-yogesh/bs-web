import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { UpdateProfileInput } from "@/schemas/profile.schema";
import type { PublicProfile, User } from "@/types";

export const userService = {
  async getByUsername(username: string): Promise<PublicProfile> {
    const { data } = await api.get<PublicProfile>(
      apiRoutes.users.byUsername(username),
    );
    return data;
  },

  async update(id: string, input: Partial<UpdateProfileInput>): Promise<User> {
    const { data } = await api.put<User>(apiRoutes.users.update(id), input);
    return data;
  },
};
