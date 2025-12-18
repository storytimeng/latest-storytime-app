"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const LibraryView = dynamic(
  () => import("@/views").then((mod) => mod.LibraryView),
  {
    ssr: false,
  }
);

const OldLibraryPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LibraryView />
    </Suspense>
  );
};

export default OldLibraryPage;
