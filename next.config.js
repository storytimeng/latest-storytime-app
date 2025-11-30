/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS hostnames
     //   hostname: "storytime.ng",
      },
      {
        protocol: "http",
        hostname: "**", // Allow all HTTP hostnames (for development)
      //  hostname: "storytime.ng",
      },
    ],
  },
};

module.exports = nextConfig;
