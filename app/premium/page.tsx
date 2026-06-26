import { Metadata } from "next";
import { PremiumView } from "@/views";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Storytime Premium",
  description: "Unlock exclusive stories, ad-free reading, and premium features on Storytime. Upgrade to Premium and enjoy unlimited access to the best African fiction.",
  alternates: { canonical: `${APP_CONFIG.url}/premium` },
  openGraph: {
    title: "Storytime Premium — Unlimited Reading",
    description: "Unlock exclusive stories, ad-free reading, and premium features on Storytime.",
    url: `${APP_CONFIG.url}/premium`,
    siteName: APP_CONFIG.name,
    images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: "Storytime Premium" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storytime Premium — Unlimited Reading",
    description: "Unlock exclusive stories, ad-free reading, and premium features on Storytime.",
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

const PremiumPage = () => {
  return <PremiumView />;
};

export default PremiumPage;
