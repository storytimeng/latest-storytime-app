import { Suspense } from "react";
import PremiumCallbackPage from "./page.client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Verifying payment...
        </div>
      }
    >
      <PremiumCallbackPage />
    </Suspense>
  );
}
