import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/who',
        destination: '/my-relationships',
        permanent: true,
      },
      {
        source: '/what',
        destination: '/my-info',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Named version aliases — /april-2026/* serves /v1/*
      {
        source: '/april-2026',
        destination: '/v1',
      },
      {
        source: '/april-2026/:path*',
        destination: '/v1/:path*',
      },
      // Named version aliases — /book-aligned/* serves /v2/*
      {
        source: '/book-aligned',
        destination: '/v2',
      },
      {
        source: '/book-aligned/:path*',
        destination: '/v2/:path*',
      },
    ]
  },
};

export default nextConfig;
