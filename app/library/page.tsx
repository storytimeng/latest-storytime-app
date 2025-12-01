import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

// Lazy load library view
const NewLibraryView = lazy(() =>
  import("@/views").then((mod) => ({ default: mod.NewLibraryView }))
);

const LibraryPage = () => {
  return (
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
  );
};

export default LibraryPage;
