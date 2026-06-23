export const APP_CONFIG = {
  name: "Storytime",
  siteName: "Storytime",
  description:
    "Storytime is the home for budding authors and curious readers. A cheerful community where stories are shared, skills are nurtured, and imagination comes alive. Whether you're writing your first chapter or discovering your next favourite story, Storytime gives you a place to grow, create and belong. Because every great storyteller starts somewhere.",
  shortDescription: "Home To Budding Authors & Readers. Read, Write, & Grow.",
  domain: "storytime.ng",
  url: "https://storytime.ng",

  theme: {
    defaultTheme: "light",
    color: "#ffffff",
  },

  keywords: [
    "storytime",
    "read stories online",
    "write stories",
    "African stories",
    "creative writing",
    "fiction platform",
    "budding authors",
    "story community",
    "Nigerian stories",
    "Yoruba stories",
    "Igbo stories",
    "Hausa stories",
    "storytelling",
    "online reading",
    "story app",
  ],

  logo: {
    src: "/images/logo.png",
    alt: "Storytime Logo",
    width: 85,
    height: 28,
  },

  favicon: {
    src: "/images/logo.png",
    sizes: "32x32",
    type: "image/png",
  },

  // Social media and SEO images
  images: {
    // Small logo for favicon, app icons, etc.
    logo: "/images/logo.png",
    // Banner for social media previews (Facebook, Twitter, etc.)
    banner: "/images/banner.png",
    // Default OG image for social sharing
    ogImage: "/images/logo.png",
  },

  // Open Graph / Social Media metadata
  socialMeta: {
    twitterCard: "summary_large_image" as const,
    twitterSite: "@storytimeng",
    ogType: "website" as const,
    ogLocale: "en_US",
  },

  // Social Media Links & Handles
  social: {
    handles: {
      twitter: "@storytimeng",
      instagram: "@storytimeng",
      facebook: "@storytimeng",
      youtube: "@storytimeng",
      tiktok: "@storytimeng",
      linkedin: "storytimeng",
    },
    links: {
      twitter: "https://twitter.com/storytimeng",
      instagram: "https://instagram.com/storytimeng",
      facebook: "https://facebook.com/storytimeng",
      youtube: "https://youtube.com/@storytimeng",
      tiktok: "https://tiktok.com/@storytimeng",
      linkedin: "https://linkedin.com/company/storytimeng",
      website: "https://storytime.ng",
    },
  },

  analytics: {
    googleAnalyticsId: "",
    googleTagManagerId: "",
  },

  topLoader: {
    color: "#000000",
    showSpinner: false,
    easing: "ease",
  },

  toaster: {
    position: "top-right" as const,
    expand: false,
  },
};
