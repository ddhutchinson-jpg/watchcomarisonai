import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "watchcompareai.com",
          },
        ],
        destination: "https://deezwatchez.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.watchcompareai.com",
          },
        ],
        destination: "https://deezwatchez.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.deezwatchez.com",
          },
        ],
        destination: "https://deezwatchez.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
