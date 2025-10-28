"use client";

import { ThemeProvider } from "@/lib/theme-provider";
import { MaxWidthWrapper } from "@/lib/maxWidthWrapper";
import InternetStatus from "@/lib/internetCheck";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { HeroUIProvider } from "@heroui/react";
import { APP_CONFIG } from "@/config";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={APP_CONFIG.theme.defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <NextTopLoader
          color={APP_CONFIG.topLoader.color}
          showSpinner={APP_CONFIG.topLoader.showSpinner}
          easing={APP_CONFIG.topLoader.easing}
        />
        <MaxWidthWrapper>{children}</MaxWidthWrapper>

        <Toaster
          position={APP_CONFIG.toaster.position}
          expand={APP_CONFIG.toaster.expand}
        />
        <InternetStatus />
      </HeroUIProvider>
    </ThemeProvider>
  );
}
