export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  feed: {
    all: ["feed"] as const,
    list: (filter?: { cursor?: string }) =>
      [...queryKeys.feed.all, "list", filter ?? {}] as const,
  },
  posts: {
    all: ["posts"] as const,
    detail: (id: string) => [...queryKeys.posts.all, "detail", id] as const,
    comments: (id: string) =>
      [...queryKeys.posts.all, "comments", id] as const,
  },
  profile: {
    all: ["profile"] as const,
    byUsername: (username: string) =>
      [...queryKeys.profile.all, "byUsername", username] as const,
  },
  connections: {
    all: ["connections"] as const,
    list: () => [...queryKeys.connections.all, "list"] as const,
    suggestions: () => [...queryKeys.connections.all, "suggestions"] as const,
  },
  follows: {
    all: ["follows"] as const,
    status: (userId: string) =>
      [...queryKeys.follows.all, "status", userId] as const,
  },
  me: {
    all: ["me"] as const,
    insights: () => [...queryKeys.me.all, "insights"] as const,
  },
  messages: {
    all: ["messages"] as const,
    threads: () => [...queryKeys.messages.all, "threads"] as const,
    thread: (id: string) => [...queryKeys.messages.all, "thread", id] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (filter?: Record<string, unknown>) =>
      [...queryKeys.jobs.all, "list", filter ?? {}] as const,
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
    unreadCount: () =>
      [...queryKeys.notifications.all, "unreadCount"] as const,
  },
} as const;
