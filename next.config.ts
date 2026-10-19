import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/what', destination: '/my-info', permanent: true },
      // Removed in the October 2026 cleanup: send old bookmarks somewhere useful.
      { source: '/who', destination: '/my-info', permanent: false },
      { source: '/my-relationships/:path*', destination: '/my-info', permanent: false },
      { source: '/my-relationships', destination: '/my-info', permanent: false },
      { source: '/graphic-exemplar', destination: '/about', permanent: false },
      { source: '/:version(v1|v2|april-2026|book-aligned)/:path*', destination: '/', permanent: false },
      { source: '/:version(v1|v2|april-2026|book-aligned)', destination: '/', permanent: false },
    ]
  },
};

export default nextConfig;
