import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.storytimeng",
  appName: "StoryTime",
  webDir: "out",
  // Match the production domain so Android/iOS password managers can
  // associate saved credentials with this app (see Capacitor autofill docs).
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
  },
};

export default config;
