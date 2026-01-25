import React, { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import { TabLayout } from "@/views";

// Lazy load HomeView for better initial load performance
const HomeView = lazy(() =>
  import("@/views").then((mod) => ({ default: mod.HomeView }))
);

const HomePage = () => {
  return (
    <TabLayout>
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
