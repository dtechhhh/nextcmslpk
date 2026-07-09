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
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
