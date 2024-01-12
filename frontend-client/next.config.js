/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  async headers() {
    return [
      {
        source: '/next-auth/api/auth/:slug',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      }
    ]
  }
}

module.exports = nextConfig
