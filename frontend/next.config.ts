import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aura/shared", "@aura/backend"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL || "http://65.1.222.7";
    const cleanTarget = target.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/markets/:path*",
        destination: `${cleanTarget}/api/markets/:path*`,
      },
      {
        source: "/api/orders/:path*",
        destination: `${cleanTarget}/api/orders/:path*`,
      },
      {
        source: "/api/portfolio/:path*",
        destination: `${cleanTarget}/api/portfolio/:path*`,
      },
      {
        source: "/api/watchlist/:path*",
        destination: `${cleanTarget}/api/watchlist/:path*`,
      },
      {
        source: "/api/broker/:path*",
        destination: `${cleanTarget}/api/broker/:path*`,
      },
      {
        source: "/api/bot/:path*",
        destination: `${cleanTarget}/api/bot/:path*`,
      },
      {
        source: "/api/analytics/:path*",
        destination: `${cleanTarget}/api/analytics/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${cleanTarget}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
