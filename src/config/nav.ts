import { appRoutes } from "./routes/app.routes";
import type { IconName } from "@/components/icons/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export const mainNav: readonly NavItem[] = [
  { label: "Home", href: appRoutes.home, icon: "home" },
  { label: "My Network", href: appRoutes.network, icon: "network" },
  { label: "Listings", href: appRoutes.listings, icon: "briefcase" },
  { label: "Messages", href: appRoutes.messages, icon: "message" },
  { label: "Notifications", href: appRoutes.notifications, icon: "bell" },
] as const;

export type BottomNavItem =
  | { kind: "link"; label: string; href: string; icon: IconName; badge?: boolean }
  | { kind: "action"; label: string; icon: IconName; action: "compose" };

export const bottomNav: readonly BottomNavItem[] = [
  { kind: "link", label: "Home", href: appRoutes.home, icon: "home" },
  { kind: "link", label: "Network", href: appRoutes.network, icon: "network" },
  { kind: "action", label: "Post", icon: "plus", action: "compose" },
  {
    kind: "link",
    label: "Alerts",
    href: appRoutes.notifications,
    icon: "bell",
    badge: true,
  },
  {
    kind: "link",
    label: "Listings",
    href: appRoutes.listings,
    icon: "briefcase",
  },
] as const;
