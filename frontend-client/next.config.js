/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  env: {
    NEXTAUTH_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/next-auth/api/auth`
      : process.env.NEXTAUTH_URL
  }
}

module.exports = nextConfig
