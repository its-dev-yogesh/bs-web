export const apiRoutes = {
  auth: {
    login: "/auth/login",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  users: {
    list: "/users",
    create: "/users",
    byId: (id: string) => `/users/${id}`,
    byUsername: (username: string) => `/users/username/${username}`,
    byEmail: (email: string) => `/users/email/${encodeURIComponent(email)}`,
    update: (id: string) => `/users/${id}`,
    profile: (id: string) => `/users/${id}/profile`,
  },
  posts: {
    list: "/posts",
    createListing: "/posts/listings",
    createRequirement: "/posts/requirements",
    byId: (id: string) => `/posts/${id}`,
    media: (id: string) => `/posts/${id}/media`,
    reactions: (id: string) => `/posts/${id}/reactions`,
    comments: (id: string) => `/posts/${id}/comments`,
    save: (id: string) => `/posts/${id}/save`,
  },
  /** Threaded comments use posts.comments; likes are separate paths (match bs-backend). */
  comments: {
    byId: (commentId: string) => `/comments/${commentId}`,
  },
  commentLikes: {
    like: (commentId: string) => `/comments/${commentId}/like`,
  },
  feed: {
    home: "/feeds",
  },
  savedPosts: {
    list: "/saved-posts",
  },
  connections: {
    list: "/connections",
    suggestions: "/connections/suggestions",
    request: "/connections/requests",
    accept: (requestId: string) => `/connections/requests/${requestId}/accept`,
    decline: (requestId: string) =>
      `/connections/requests/${requestId}/decline`,
  },
  messages: {
    threads: "/messages/threads",
    thread: (id: string) => `/messages/threads/${id}`,
    send: (threadId: string) => `/messages/threads/${threadId}/messages`,
  },
  leads: {
    list: "/leads",
    create: "/leads",
    updateStatus: (id: string) => `/leads/${id}/status`,
  },
  search: {
    list: "/search",
  },
  verification: {
    submitKyc: "/verification/kyc",
    myKyc: "/verification/kyc/me",
    pendingKyc: "/verification/kyc/pending",
    reviewKyc: (id: string) => `/verification/kyc/${id}/review`,
  },
  moderation: {
    report: "/moderation/reports",
    openReports: "/moderation/reports/open",
    reviewReport: (id: string) => `/moderation/reports/${id}/review`,
  },
  analytics: {
    dashboard: "/analytics/dashboard",
  },
  monetization: {
    plans: "/monetization/plans",
  },
  jobs: {
    list: "/jobs",
    byId: (id: string) => `/jobs/${id}`,
    apply: (id: string) => `/jobs/${id}/apply`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all",
    unreadCount: "/notifications/unread-count",
  },
  uploads: {
    single: "/upload/single",
    multiple: "/upload/multiple",
    fields: "/upload/fields",
  },
} as const;
