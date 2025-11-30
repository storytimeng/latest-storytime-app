import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { APP_CONFIG } from "@/config/app";
import { MaxWidthWrapper } from "@/lib/maxWidthWrapper";
import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";
import { GenresPreloader } from "@/components/preloaders/GenresPreloader";

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.siteName }],
  creator: APP_CONFIG.siteName,
  publisher: APP_CONFIG.siteName,
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.siteName,
    images: [
      {
        url: APP_CONFIG.images.banner,
        width: 1200,
        height: 630,
        alt: APP_CONFIG.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: APP_CONFIG.socialMeta.twitterCard,
    site: APP_CONFIG.socialMeta.twitterSite,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: [APP_CONFIG.images.banner],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={cn(
          "m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased",
          Magnetik_Medium.className,
          Magnetik_Medium.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <GenresPreloader />
          <MaxWidthWrapper>{children}</MaxWidthWrapper>
          <LoadingOverlay />
        </Providers>
      </body>
    </html>
  );
}

