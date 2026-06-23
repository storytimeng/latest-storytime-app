import { APP_CONFIG } from "@/config/app";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.shortDescription,
  links: APP_CONFIG.social.links,
};
