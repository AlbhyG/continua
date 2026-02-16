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
};

export default nextConfig;
