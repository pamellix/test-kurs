import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://195.58.37.85:8080/api/:path*',
      },
    ]
  },
};

export default nextConfig;
