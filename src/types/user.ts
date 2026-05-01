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
  /** Vertical crop focus for avatar image (0 top, 100 bottom). */
  avatarPositionY?: number;
  /** Avatar zoom level for crop framing (1x-3x). */
  avatarZoom?: number;
  bannerUrl?: string;
  /** Vertical crop focus for banner image (0 top, 100 bottom). */
  bannerPositionY?: number;
  /** Banner zoom level for crop framing (1x-3x). */
  bannerZoom?: number;
  bannerTheme?: string;
  location?: string;
  bio?: string;
};

export type PublicProfile = User & {
  connectionsCount?: number;
  isConnected?: boolean;
  isPendingRequest?: boolean;
  /** Viewer sent a connection request (when viewing with Bearer token). */
  pendingOutgoing?: boolean;
  /** Viewer received a pending request from this profile user. */
  pendingIncoming?: boolean;
  /** ID of the connection request when `pendingIncoming` (for accept/decline on profile). */
  pendingRequestId?: string;
  /** Number of mutual followers (people the viewer follows who also follow this user). */
  mutualCount?: number;
};
