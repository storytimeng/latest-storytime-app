import type { Metadata } from "next";
import React, { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import TabLayout from "@/views/app/TabLayout";
import { APP_CONFIG } from "@/config/app";
import { IS_ANDROID } from "@/lib/platform";

export const metadata: Metadata = IS_ANDROID
  ? { title: "Storytime" }
  : {
      title: "Discover Stories",
      description:
        "Browse trending, popular, and newly published stories across genres on Storytime.",
      alternates: { canonical: `${APP_CONFIG.url}/home` },
      openGraph: {
        title: `Discover Stories | ${APP_CONFIG.name}`,
        description:
          "Browse trending, popular, and newly published stories across genres on Storytime.",
        url: `${APP_CONFIG.url}/home`,
        siteName: APP_CONFIG.name,
        type: "website",
      },
    };

// Lazy load HomeView directly (avoid @/views barrel bundle)
const HomeView = lazy(() =>
  import("@/views/app/home/homeView").then((mod) => ({
    default: mod.default,
  })),
);

const HomePage = () => {
  return (
    <TabLayout>
      {/* Visually hidden H1 for SEO - screen readers and crawlers see it, users don't */}
      <h1 className="sr-only">
        Storytime - Read and Write African Stories Online
      </h1>
      <Suspense
        fallback={
          <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>
        }
      >
        <HomeView />
      </Suspense>
    </TabLayout>
  );
};

export default HomePage;
