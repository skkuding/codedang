/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      }
    ]
  }
}

module.exports = nextConfig
