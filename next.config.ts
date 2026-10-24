import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The page was renamed from "My Info" to "My Continua" (Oct 2026); keep old links working.
      { source: '/my-info', destination: '/my-continua', permanent: true },
      { source: '/what', destination: '/my-continua', permanent: true },
      // Removed in the October 2026 cleanup: send old bookmarks somewhere useful.
      { source: '/who', destination: '/my-continua', permanent: false },
      { source: '/my-relationships/:path*', destination: '/my-continua', permanent: false },
      { source: '/my-relationships', destination: '/my-continua', permanent: false },
      { source: '/graphic-exemplar', destination: '/about', permanent: false },
      { source: '/:version(v1|v2|april-2026|book-aligned)/:path*', destination: '/', permanent: false },
      { source: '/:version(v1|v2|april-2026|book-aligned)', destination: '/', permanent: false },
    ]
  },
};

export default nextConfig;
