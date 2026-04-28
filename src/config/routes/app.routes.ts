export const appRoutes = {
  home: "/",
  feed: "/",
  login: "/login",
  register: "/register",
  profile: (username: string) => `/profile/${username}`,
  connections: "/connections",
  messages: "/messages",
  thread: (threadId: string) => `/messages/${threadId}`,
  jobs: "/jobs",
  jobDetail: (jobId: string) => `/jobs/${jobId}`,
  notifications: "/notifications",
} as const;
