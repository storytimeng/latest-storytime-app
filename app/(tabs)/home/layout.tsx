import { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: "Storytime - Read and Write African Stories Online",
  description: APP_CONFIG.description,
  alternates: { canonical: APP_CONFIG.url },
  openGraph: {
    title: "Storytime - Read and Write African Stories Online",
    description: APP_CONFIG.shortDescription,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`,
        width: 1200,
        height: 630,
        alt: "Storytime - Home To Budding Authors & Readers",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storytime - Read and Write African Stories Online",
    description: APP_CONFIG.shortDescription,
    images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
