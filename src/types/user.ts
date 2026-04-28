export type UserType = "agent" | "user";
export type UserStatus = "active" | "banned" | "deleted";

export type User = {
  id?: string;
  _id?: string;
  username: string;
  phone: string;
  email?: string;
  type: UserType;
  status?: UserStatus;
  is_verified?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Optional fields populated from /user-profile endpoints when available.
  name?: string;
  headline?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  bio?: string;
};

export type PublicProfile = User & {
  connectionsCount: number;
  isConnected: boolean;
  isPendingRequest: boolean;
};
