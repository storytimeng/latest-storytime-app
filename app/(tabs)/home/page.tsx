import React, { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import TabLayout from "@/views/app/TabLayout";

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
