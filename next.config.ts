import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL ?? "https://media.yourdomain.com";

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
