/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://195.58.37.85:8080/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
