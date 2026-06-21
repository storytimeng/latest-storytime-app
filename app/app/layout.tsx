import { DesktopAppLayoutClient } from "@/components/desktop/DesktopAppLayoutClient";
import { AmbassadorRoutesProvider } from "@/components/ambassador/AmbassadorRoutesProvider";

export default function DesktopAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AmbassadorRoutesProvider shell="desktop">
      <DesktopAppLayoutClient>{children}</DesktopAppLayoutClient>
    </AmbassadorRoutesProvider>
  );
}
