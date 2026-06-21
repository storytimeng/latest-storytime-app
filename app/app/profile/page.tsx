import { Suspense } from "react";
import { DesktopProfileView } from "@/views/desktop";

export default function DesktopProfilePage() {
  return (
    <Suspense fallback={null}>
      <DesktopProfileView />
    </Suspense>
  );
}
