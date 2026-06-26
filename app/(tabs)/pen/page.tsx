import { Metadata } from "next";
import { PenView } from "@/views";
import { TabLayout } from "@/views";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Write Stories",
  description: "Start writing your story on Storytime. Create chapters, build your audience, and share your imagination with thousands of readers across Africa and beyond.",
  alternates: { canonical: `${APP_CONFIG.url}/pen` },
  openGraph: {
    title: "Write Stories | Storytime",
    description: "Start writing your story on Storytime. Create chapters, build your audience, and share your imagination.",
    url: `${APP_CONFIG.url}/pen`,
    siteName: APP_CONFIG.name,
    images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: "Write Stories on Storytime" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Write Stories | Storytime",
    description: "Start writing your story on Storytime. Create chapters and share your imagination.",
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

const PenPage = () => {
  return (
    <TabLayout>
      <PenView />
    </TabLayout>
  );
};

export default PenPage;
