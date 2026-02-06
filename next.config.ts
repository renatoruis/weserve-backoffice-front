import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@auth0/nextjs-auth0"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
