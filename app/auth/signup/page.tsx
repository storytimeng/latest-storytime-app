import React, { Suspense } from "react";
import { SignupView } from "@/views";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupView />
    </Suspense>
  );
}
