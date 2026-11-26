import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import TabLayout from "@/views/app/TabLayout";

// Lazy load library view directly (avoid @/views barrel bundle)
const NewLibraryView = lazy(() =>
  import("@/views/app/library/newLibraryView").then((mod) => ({
    default: mod.default,
  })),
);

const LibraryPage = () => {
  return (
    <TabLayout>
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-16 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
        </div>
      }
    >
      <NewLibraryView />
    </Suspense>
    </TabLayout>
  );
};

export default LibraryPage;
