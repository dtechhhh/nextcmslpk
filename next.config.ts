import type { NextConfig } from "next";
import { env } from "./src/lib/env";

const r2PublicUrl = env.R2_PUBLIC_URL;

function getR2PublicHostname() {
  try {
    return new URL(r2PublicUrl).hostname;
  } catch {
    return "media.yourdomain.com";
  }
}

const nextConfig: NextConfig = {
  images: {
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
