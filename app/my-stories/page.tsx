import { Suspense } from "react";
import { MyStoriesView } from "@/views";

const MyStoriesPage = () => {
  return (
    <Suspense fallback={null}>
      <MyStoriesView />
    </Suspense>
  );
};

export default MyStoriesPage;
