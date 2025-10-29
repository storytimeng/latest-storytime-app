import type { Metadata, Viewport } from "next";
import { MaxWidthWrapper, cn, ThemeProvider, Magnetik_Medium } from "@/lib";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/reusables/customUI";
import { APP_CONFIG } from "@/config/app";

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
	themeColor: APP_CONFIG.theme.color,
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning>
			<body className={cn("m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased scrollbar-hide", Magnetik_Medium.className)}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					<NextTopLoader
						color="#000000"
						showSpinner={false}
						easing="ease"
					/>
					<Header />
					<MaxWidthWrapper>{children}</MaxWidthWrapper>

					<Toaster
						position="top-right"
						expand={false}
					/>
					<GoogleAnalytics gaId="" />
					<GoogleTagManager gtmId="" />
				</ThemeProvider>
			</body>
		</html>
	);
}
