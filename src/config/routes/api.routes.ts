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
    create: "/users",
    byId: (id: string) => `/users/${id}`,
    byUsername: (username: string) => `/users/username/${username}`,
    byEmail: (email: string) => `/users/email/${encodeURIComponent(email)}`,
    update: (id: string) => `/users/${id}`,
  },
  posts: {
    list: "/posts",
    create: "/posts",
    byId: (id: string) => `/posts/${id}`,
    like: (id: string) => `/posts/${id}/like`,
    comments: (id: string) => `/posts/${id}/comments`,
  },
  feed: {
    home: "/feeds",
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
  jobs: {
    list: "/jobs",
    byId: (id: string) => `/jobs/${id}`,
    apply: (id: string) => `/jobs/${id}/apply`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
    unreadCount: "/notifications/unread-count",
  },
  uploads: {
    sign: "/uploads/sign",
  },
} as const;
