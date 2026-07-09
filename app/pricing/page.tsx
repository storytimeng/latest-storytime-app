import { Metadata } from "next";
import { title } from "@/components/primitives";
import { APP_CONFIG } from "@/config/app";
import PricingPageBody from "./PricingPageBody";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Storytime Premium. Start reading for free or upgrade for unlimited access to exclusive stories and premium features.",
  alternates: { canonical: `${APP_CONFIG.url}/pricing` },
  openGraph: {
    title: "Pricing | Storytime",
    description:
      "Simple, transparent pricing for Storytime Premium. Start free, upgrade anytime.",
    url: `${APP_CONFIG.url}/pricing`,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`,
        width: 1200,
        height: 630,
        alt: "Storytime Pricing",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Storytime",
    description:
      "Simple, transparent pricing for Storytime Premium. Start free, upgrade anytime.",
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

export default function PricingPage() {
  return (
    <div>
      <h1 className={title()}>Pricing</h1>
      <PricingPageBody />
    </div>
  );
}
