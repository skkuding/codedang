/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: vercel doesn't support experimental features yet
  // experimental: {
  //   typedRoutes: true
  // },
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
}

module.exports = nextConfig
