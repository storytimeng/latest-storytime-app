import { withSerwist } from "@serwist/turbopack";

/** @type {import('next').NextConfig} */
const isAndroid = process.env.NEXT_PUBLIC_PLATFORM == "android";
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  output: isAndroid ? "export" : undefined,
  trailingSlash: isAndroid ? true : undefined,
  images: {
    unoptimized: isAndroid,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

// withSerwist just augments the Next config to mark esbuild/esbuild-wasm as
// external server packages so the Route Handler at app/serwist/[path]/route.ts
// can import them under Turbopack. All SW generation lives in that route file.
export default isAndroid ? nextConfig : withSerwist(nextConfig);
