import type { NextConfig } from "next";
import path from "node:path";

const backendUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
