import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { APP_CONFIG } from "@/config/app";
import { MaxWidthWrapper } from "@/lib/maxWidthWrapper";
import { Providers } from "./providers";
import { PWAProvider } from "@/components/PWAProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";
import { GenresPreloader } from "@/components/preloaders/GenresPreloader";
import { SupportModals } from "@/components/reusables/modals/SupportModals";
import { OfflineManager } from "@/components/OfflineManager";

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.siteName }],
  creator: APP_CONFIG.siteName,
  publisher: APP_CONFIG.siteName,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.name,
  },
  formatDetection: {
    telephone: false,
  },
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
  themeColor: "#F8951D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* iOS Splash Screens */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/apple-splash-1290-2796.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/apple-splash-1179-2556.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/apple-splash-1284-2778.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/apple-splash-1170-2532.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/apple-splash-1125-2436.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-828-1792.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-750-1334.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-640-1136.png"
        />
        {/* iPad splash screens */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-2048-2732.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-1668-2388.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-1668-2224.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-1620-2160.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/apple-splash-1536-2048.png"
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased",
          Magnetik_Medium.className,
          Magnetik_Medium.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <PWAProvider>
            <GenresPreloader />
            <MaxWidthWrapper>{children}</MaxWidthWrapper>
            <LoadingOverlay />
            <PWAInstallPrompt />
            <SupportModals />
            <OfflineManager />
          </PWAProvider>
        </Providers>
      </body>
    </html>
  );
}
