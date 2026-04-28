export const siteConfig = {
  name: "BrokerSocial",
  shortName: "BS",
  description: "Connect, share, and grow with your professional network.",
  defaultLocale: "en",
  ogImage: "/og.png",
} as const;

export type SiteConfig = typeof siteConfig;
