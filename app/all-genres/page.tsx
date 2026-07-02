import { Suspense } from "react";
import AllGenresClient from "./client";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AllGenresClient />
    </Suspense>
  );
}
