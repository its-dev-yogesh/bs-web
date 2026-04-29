import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type { UpdateProfileInput } from "@/schemas/profile.schema";
import type { PublicProfile, User } from "@/types";

type RawUser = {
  _id?: string;
  id?: string;
  username: string;
  phone?: string;
  email?: string;
  type?: User["type"];
  status?: User["status"];
  is_verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type RawUserProfile = {
  _id?: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  rerano?: string;
  dob?: string;
  gender?: string;
};

function mapUser(raw: RawUser): User {
  return {
    id: raw._id ?? raw.id,
    _id: raw._id ?? raw.id,
    username: raw.username,
    phone: raw.phone ?? "",
    email: raw.email,
    type: raw.type ?? "user",
    status: raw.status,
    is_verified: raw.is_verified,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function mergeProfile(user: User, profile: RawUserProfile | null): User {
  if (!profile) return user;
  return {
    ...user,
    name: profile.full_name ?? user.name,
    avatarUrl: profile.avatar_url ?? user.avatarUrl,
    bio: profile.bio ?? user.bio,
    location: profile.location ?? user.location,
  };
}

async function fetchRawById(idOrUsername: string): Promise<RawUser | null> {
  try {
    const { data } = await api.get<RawUser | null>(
      apiRoutes.users.byId(idOrUsername),
    );
    return data ?? null;
  } catch {
    return null;
  }
}

async function fetchRawByUsername(username: string): Promise<RawUser | null> {
  try {
    const { data } = await api.get<RawUser | null>(
      apiRoutes.users.byUsername(username),
    );
    return data ?? null;
  } catch {
    return null;
  }
}

async function fetchProfile(userId: string): Promise<RawUserProfile | null> {
  try {
    const { data } = await api.get<RawUserProfile | null>(
      apiRoutes.users.profile(userId),
    );
    return data ?? null;
  } catch {
    return null;
  }
}

export const userService = {
  async getProfile(idOrUsername: string): Promise<User | null> {
    const raw =
      (await fetchRawById(idOrUsername)) ??
      (await fetchRawByUsername(idOrUsername));
    if (!raw) return null;
    const user = mapUser(raw);
    const userId = user._id ?? user.id;
    const profile = userId ? await fetchProfile(userId) : null;
    return mergeProfile(user, profile);
  },

  async getByUsername(username: string): Promise<PublicProfile> {
    const user = await this.getProfile(username);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      ...user,
      connectionsCount: 0,
      isConnected: false,
      isPendingRequest: false,
    };
  },

  async list(): Promise<User[]> {
    const { data } = await api.get<RawUser[]>(apiRoutes.users.list);
    const list = Array.isArray(data) ? data : [];
    return list.map(mapUser);
  },

  async update(id: string, input: Partial<UpdateProfileInput>): Promise<User> {
    const { data } = await api.put<RawUser>(apiRoutes.users.update(id), input);
    return mapUser(data);
  },
};
