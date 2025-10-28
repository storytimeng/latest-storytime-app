import { AuthLayoutView } from "@/views";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutView>{children}</AuthLayoutView>;
}
