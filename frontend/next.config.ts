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
        source: "/socket.io/:path*",
        destination: `${cleanTarget}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
