export const appRoutes = {
  home: "/",
  feed: "/",
  login: "/login",
  register: "/register",
  /** Logged-in user: redirects to `/profile/:username` */
  myProfile: "/profile",
  profile: (username: string) => `/profile/${username}`,
  network: "/network",
  connections: "/network",
  messages: "/messages",
  thread: (threadId: string) => `/messages/${threadId}`,
  listings: "/listings",
  jobs: "/listings",
  listingDetail: (id: string) => `/listings/${id}`,
  notifications: "/notifications",
  compose: "/?compose=1",
} as const;
