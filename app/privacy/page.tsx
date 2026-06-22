import { PrivacyPolicyView } from "@/views/legal";

export const metadata = {
  title: "Privacy Policy | Story Time",
  description:
    "Read the Story Time privacy policy to understand how we collect, use, and protect your personal data.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
