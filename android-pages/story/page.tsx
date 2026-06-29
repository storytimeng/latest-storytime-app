import { Suspense } from "react";
import StoryClientPage from "./client";

export default function StoryPage() {
  return (
    <Suspense>
      <StoryClientPage />
    </Suspense>
  );
}
