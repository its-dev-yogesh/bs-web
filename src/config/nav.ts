import { appRoutes } from "./routes/app.routes";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export const mainNav: readonly NavItem[] = [
  { label: "Home", href: appRoutes.home, icon: "home" },
  { label: "Connections", href: appRoutes.connections, icon: "users" },
  { label: "Jobs", href: appRoutes.jobs, icon: "briefcase" },
  { label: "Messages", href: appRoutes.messages, icon: "message" },
  { label: "Notifications", href: appRoutes.notifications, icon: "bell" },
] as const;
