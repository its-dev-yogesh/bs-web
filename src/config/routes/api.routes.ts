/**
 * API route definitions for the chanakya-astra-service backend.
 *
 * Endpoints under the social/community feature surface live behind the
 * `/community-*` prefixes after the bs-backend → astra-service merge.
 * Endpoints with no astra equivalent yet are left at their legacy paths
 * and marked TODO; calling them will 404 until they are wired on the
 * server.
 */
export const apiRoutes = {
  auth: {
    register: "/community-auth/register",
    verifyRegistration: "/community-auth/verify-registration",
    login: "/community-auth/login",
    verifyOtp: "/community-auth/verify-otp",
    resendOtp: "/community-auth/resend-otp",
    logout: "/community-auth/logout",
    refresh: "/community-auth/refresh",
    me: "/community-auth/me",
  },
  users: {
    // TODO: not yet implemented in community-* — only the profile sub-route exists.
    list: "/community-users",
    create: "/community-users",
    search: "/community-users/search",
    byId: (id: string) => `/community-users/${id}`,
    byUsername: (username: string) =>
      `/community-users/username/${username}`,
    byEmail: (email: string) =>
      `/community-users/email/${encodeURIComponent(email)}`,
    update: (id: string) => `/community-users/${id}`,
    profile: (userId: string) => `/community-users/${userId}/profile`,
  },
  posts: {
    list: "/community-posts",
    counts: "/community-posts/counts",
    myDrafts: "/community-posts/me/drafts",
    createListing: "/community-posts/listings",
    createRequirement: "/community-posts/requirements",
    byId: (id: string) => `/community-posts/${id}`,
    publish: (id: string) => `/community-posts/${id}/publish`,
    updateListing: (id: string) => `/community-posts/${id}/listing`,
    updateRequirement: (id: string) => `/community-posts/${id}/requirement`,
    media: (id: string) => `/community-posts/${id}/media`,
    mediaItem: (mediaId: string) => `/community-posts/media/${mediaId}`,
    reactions: (postId: string) => `/community-posts/${postId}/reactions`,
    reactionCounts: (postId: string) =>
      `/community-posts/${postId}/reactions/counts`,
    comments: (postId: string) => `/community-posts/${postId}/comments`,
    save: (postId: string) => `/community-posts/${postId}/save`,
    isSaved: (postId: string) => `/community-posts/${postId}/saved`,
    saves: (postId: string) => `/community-posts/${postId}/saves`,
  },
  /** Comment-level routes (likes, replies, delete) live under /community-comments. */
  comments: {
    byId: (commentId: string) => `/community-comments/${commentId}`,
    replies: (commentId: string) =>
      `/community-comments/${commentId}/replies`,
  },
  commentLikes: {
    like: (commentId: string) => `/community-comments/${commentId}/like`,
  },
  feed: {
    home: "/community-feeds",
    regenerate: "/community-feeds/regenerate",
  },
  savedPosts: {
    list: "/community-saved-posts",
  },
  connections: {
    list: "/community-connections",
    suggestions: "/community-connections/suggestions",
    request: "/community-connections/requests",
    accept: (requestId: string) =>
      `/community-connections/requests/${requestId}/accept`,
    decline: (requestId: string) =>
      `/community-connections/requests/${requestId}/decline`,
    // TODO: unfollow has no community-* equivalent yet — left for parity.
    unfollow: (userId: string) => `/community-connections/${userId}`,
  },
  messages: {
    threads: "/community-messages/threads",
    thread: (id: string) => `/community-messages/threads/${id}`,
    send: (threadId: string) =>
      `/community-messages/threads/${threadId}/messages`,
  },
  // TODO: leads were intentionally NOT migrated into community-*. These point at
  // legacy bs-backend paths that no longer exist on astra-service.
  leads: {
    list: "/leads",
    create: "/leads",
    updateStatus: (id: string) => `/leads/${id}/status`,
  },
  // TODO: stories have no community-* equivalent yet.
  stories: {
    create: "/stories",
    feed: "/stories/feed",
    byId: (id: string) => `/stories/${id}`,
  },
  search: {
    list: "/search",
  },
  verification: {
    submitKyc: "/community-verification/kyc",
    myKyc: "/community-verification/kyc/me",
    pendingKyc: "/community-verification/kyc/pending",
    reviewKyc: (id: string) => `/community-verification/kyc/${id}/review`,
  },
  moderation: {
    report: "/community-moderation/reports",
    openReports: "/community-moderation/reports/open",
    reviewReport: (id: string) =>
      `/community-moderation/reports/${id}/review`,
  },
  analytics: {
    dashboard: "/community-analytics/dashboard",
  },
  monetization: {
    plans: "/community-monetization/plans",
  },
  // TODO: jobs have no community-* equivalent yet.
  jobs: {
    list: "/jobs",
    byId: (id: string) => `/jobs/${id}`,
    apply: (id: string) => `/jobs/${id}/apply`,
  },
  notifications: {
    list: "/community-notifications",
    markRead: (id: string) => `/community-notifications/${id}/read`,
    markAllRead: "/community-notifications/read-all",
    unreadCount: "/community-notifications/unread-count",
  },
  permissions: {
    list: "/community-permissions",
    create: "/community-permissions",
    byId: (id: string) => `/community-permissions/${id}`,
    update: (id: string) => `/community-permissions/${id}`,
    delete: (id: string) => `/community-permissions/${id}`,
    byModuleAction: (module: string, action: string) =>
      `/community-permissions/module/${module}/action/${action}`,
  },
  rolePermissions: {
    byRole: (roleName: string) =>
      `/community-role-permissions/role/${roleName}`,
    byPermission: (permissionId: string) =>
      `/community-role-permissions/permission/${permissionId}`,
    deleteRolePermission: (roleName: string, permissionId: string) =>
      `/community-role-permissions/role/${roleName}/permission/${permissionId}`,
  },
  uploads: {
    single: "/s3/upload",
    multiple: "/s3/upload/multiple",
    video: "/s3/upload-video",
    pdf: "/s3/upload-pdf",
    deleteByKey: (key: string) => `/s3/${encodeURIComponent(key)}`,
  },
} as const;
