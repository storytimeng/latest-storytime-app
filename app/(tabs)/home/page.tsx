import React, { Suspense, lazy } from "react";
import { Metadata } from "next";
import { Skeleton } from "@heroui/skeleton";
import { TabLayout } from "@/views";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Storytime — Read and Write African Stories Online",
  description: APP_CONFIG.description,
  alternates: { canonical: APP_CONFIG.url },
  openGraph: {
    title: "Storytime — Read and Write African Stories Online",
    description: APP_CONFIG.shortDescription,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: "Storytime — Home To Budding Authors & Readers" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storytime — Read and Write African Stories Online",
    description: APP_CONFIG.shortDescription,
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

// Lazy load HomeView for better initial load performance
const HomeView = lazy(() =>
  import("@/views").then((mod) => ({ default: mod.HomeView }))
);

const HomePage = () => {
  return (
    <TabLayout>
      {/* Visually hidden H1 for SEO — screen readers and crawlers see it, users don't */}
      <h1 className="sr-only">
        Storytime — Read and Write African Stories Online
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
