import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.storytimeng",
  appName: "StoryTime",
  webDir: "out",
  server: {
    hostname: "storytime.ng",
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFEBD0",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    CapacitorUpdater: {
      statsUrl: "https://xssneissyscmaibeoojq.supabase.co/functions/v1/stats",
      channelUrl:
        "https://xssneissyscmaibeoojq.supabase.co/functions/v1/channel_self",
      updateUrl:
        "https://xssneissyscmaibeoojq.supabase.co/functions/v1/updates",
      localApiFiles: "https://xssneissyscmaibeoojq.supabase.co/functions/v1",
      localS3: true,
      localSupa: "https://xssneissyscmaibeoojq.supabase.co",
      localSupaAnon: "sb_publishable_wMAICJbQ1OYszQudDGg3sA_rMm1jFpC",
      appId: "com.storytimeng",
      localHost: "https://capgo.onrender.com",
      localWebHost: "https://capgo.onrender.com",
      // Default install channel. Set to "dev" so the auto-updater
      // picks up the next push-to-main bundle (CI uploads `dev`).
      // Production app-store / Play Store builds MUST override this
      // to "production" before `npx cap sync` (e.g. via a separate
      // capacitor.config.prod.ts or a build-time sed), otherwise
      // end users will receive dev-only bundles.
      autoUpdate: true,
      defaultChannel: "dev",
      directUpdate: "atInstall",
    },
  },
};

export default config;
