import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { UpdateProfileInput } from "@/schemas/profile.schema";
import type { PublicProfile, User } from "@/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const userService = {
  async getById(id: string): Promise<User | null> {
    const userId = String(id ?? "").trim();
    if (!userId) return null;
    const { data } = await api.get<User | null>(apiRoutes.users.byId(userId));
    return data ?? null;
  },

  async getByUsername(username: string): Promise<PublicProfile> {
    const slug = String(username ?? "").trim();
    const { data } = await api.get<PublicProfile | null>(
      apiRoutes.users.byUsername(slug),
    );
    if (data) return data;

    // Feed posts can carry author id (UUID) instead of username; resolve to public profile.
    if (!UUID_REGEX.test(slug)) {
      throw new Error("Profile not found");
    }
    const byId = await this.getById(slug);
    const resolvedUsername = String(byId?.username ?? "").trim();
    if (!resolvedUsername) {
      throw new Error("Profile not found");
    }
    const { data: resolved } = await api.get<PublicProfile>(
      apiRoutes.users.byUsername(resolvedUsername),
    );
    return resolved;
  },

  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>(apiRoutes.users.list);
    return Array.isArray(data) ? data : [];
  },

  async search(q: string, limit = 10): Promise<User[]> {
    const trimmed = q.trim();
    if (!trimmed) return [];
    const { data } = await api.get<User[]>(apiRoutes.users.search, {
      params: { q: trimmed, limit },
    });
    return Array.isArray(data) ? data : [];
  },

  async remove(id: string): Promise<void> {
    await api.delete(apiRoutes.users.byId(id));
  },

  async updateUsername(id: string, username: string): Promise<User> {
    const { data } = await api.put<User>(apiRoutes.users.update(id), {
      username: username.trim(),
    });
    return data;
  },

  async update(id: string, input: Partial<UpdateProfileInput>): Promise<User> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.full_name = input.name;
    if (input.headline !== undefined) body.headline = input.headline;
    if (input.bio !== undefined) body.bio = input.bio;
    if (input.location !== undefined) body.location = input.location;
    if (input.avatarUrl !== undefined) body.avatar_url = input.avatarUrl;
    if (input.avatarPositionY !== undefined)
      body.avatar_position_y = input.avatarPositionY;
    if (input.avatarZoom !== undefined) body.avatar_zoom = input.avatarZoom;
    if (input.bannerUrl !== undefined) body.banner_url = input.bannerUrl;
    if (input.bannerPositionY !== undefined)
      body.banner_position_y = input.bannerPositionY;
    if (input.bannerZoom !== undefined) body.banner_zoom = input.bannerZoom;
    if (input.bannerTheme !== undefined) body.banner_theme = input.bannerTheme;
    const { data } = await api.put<User>(apiRoutes.users.profile(id), body);
    return data;
  },
};
