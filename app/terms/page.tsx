import { TermsOfServiceView } from "@/views/legal";

export const metadata = {
  title: "Terms of Service | Story Time",
  description:
    "Read the Story Time terms of service to understand the rules and guidelines for using our platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceView />;
}
