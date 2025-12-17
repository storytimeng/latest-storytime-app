import React, { Suspense } from "react";
import { UpdatePasswordView } from "@/views";

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordView />
    </Suspense>
  );
}
