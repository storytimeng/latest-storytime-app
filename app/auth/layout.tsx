import { AuthLayoutView } from "@/views/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutView>{children}</AuthLayoutView>;
}
