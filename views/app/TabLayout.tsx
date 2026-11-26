"use client";

import { Navbar } from "@/components/reusables";
import { useAuthGate } from "@/src/hooks/useAuthGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Global auth gate. Blocks tab-bar nav to restricted routes from any
  // page, and bounces unauthenticated users back to /home if they reach
  // a restricted route (e.g. by URL) and then dismiss the modal.
  useAuthGate({ fallbackOnDismiss: "/home" });

  return (
    <section className="bg-accent-shade-1 min-h-screen">
      <Navbar />
      <div className="md:pt-0">{children}</div>
    </section>
  );
}
