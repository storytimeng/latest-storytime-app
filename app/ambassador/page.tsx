import { Metadata } from "next";
import { AmbassadorIntroView } from "@/views/ambassador";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Become a Storytime Ambassador",
  description: "Join the Storytime Ambassador programme. Help grow the community, earn rewards, and represent the home of African storytelling wherever you are.",
  alternates: { canonical: `${APP_CONFIG.url}/ambassador` },
  openGraph: {
    title: "Become a Storytime Ambassador",
    description: "Join the Storytime Ambassador programme. Earn rewards and represent African storytelling.",
    url: `${APP_CONFIG.url}/ambassador`,
    siteName: APP_CONFIG.name,
    images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: "Storytime Ambassador Programme" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Storytime Ambassador",
    description: "Join the Storytime Ambassador programme. Earn rewards and represent African storytelling.",
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

export default function AmbassadorPage() {
  return <AmbassadorIntroView />;
}
