import type { NextConfig } from "next";
import { env } from "./src/lib/env";

const r2PublicUrl = env.R2_PUBLIC_URL;
const optimizeRemoteImages = process.env.NEXT_PUBLIC_OPTIMIZE_REMOTE_IMAGES === "true";

function getR2PublicHostname() {
  try {
    return new URL(r2PublicUrl).hostname;
  } catch {
    return "media.yourdomain.com";
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "admin.lpk.local",
    "dashboard.lpk.local",
    "hit-indonesia.lpk.local",
    "hit-japan.lpk.local",
  ],
  images: {
    unoptimized: !optimizeRemoteImages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: getR2PublicHostname(),
        pathname: "/tenants/**",
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
};

export default nextConfig;
