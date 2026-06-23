import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { APP_CONFIG } from "@/config/app";
import { MaxWidthWrapper } from "@/lib/maxWidthWrapper";
import { Providers } from "./providers";
import { PWAProvider } from "@/components/PWAProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

import { fontSans } from "@/config/fonts";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";
import { GenresPreloader } from "@/components/preloaders/GenresPreloader";
import { SupportModals } from "@/components/reusables/modals/SupportModals";
import { OfflineManager } from "@/components/OfflineManager";

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.shortDescription}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.shortDescription,
  keywords: APP_CONFIG.keywords,
  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.name, url: APP_CONFIG.url }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
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
    title: {
      default: `${APP_CONFIG.name} — ${APP_CONFIG.shortDescription}`,
      template: `%s | ${APP_CONFIG.name}`,
    },
    description: APP_CONFIG.shortDescription,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: APP_CONFIG.images.banner,
        width: 1200,
        height: 630,
        alt: `${APP_CONFIG.name} — Home To Budding Authors & Readers`,
      },
    ],
    type: "website",
    locale: APP_CONFIG.socialMeta.ogLocale,
  },
  twitter: {
    card: APP_CONFIG.socialMeta.twitterCard,
    site: APP_CONFIG.socialMeta.twitterSite,
    creator: APP_CONFIG.socialMeta.twitterSite,
    title: {
      default: `${APP_CONFIG.name} — ${APP_CONFIG.shortDescription}`,
      template: `%s | ${APP_CONFIG.name}`,
    },
    description: APP_CONFIG.shortDescription,
    images: [APP_CONFIG.images.banner],
  },
  alternates: {
    canonical: APP_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Storytime",
              url: "https://storytime.ng",
              logo: "https://storytime.ng/images/logo.png",
              description:
                "Storytime is the home for budding authors and curious readers. A cheerful community where stories are shared, skills are nurtured, and imagination comes alive.",
              sameAs: [
                "https://twitter.com/storytimeng",
                "https://instagram.com/storytimeng",
                "https://facebook.com/storytimeng",
                "https://tiktok.com/@storytimeng",
                "https://youtube.com/@storytimeng",
                "https://linkedin.com/company/storytimeng",
              ],
            }),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased",
          Magnetik_Medium.className,
          Magnetik_Medium.variable,
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
