import { DesktopAppLayoutClient } from "@/components/desktop/DesktopAppLayoutClient";

export default function DesktopAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopAppLayoutClient>{children}</DesktopAppLayoutClient>;
}
