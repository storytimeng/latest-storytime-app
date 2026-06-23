import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/",
          "/auth/",
          "/api/",
          "/profile/",
          "/settings/",
          "/ambassador/",
          "/subscriptions/",
          "/offline/",
        ],
      },
    ],
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
    host: APP_CONFIG.url,
  };
}
