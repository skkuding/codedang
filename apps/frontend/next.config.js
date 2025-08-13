const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const MEDIA_BUCKET_NAME = process.env.MEDIA_BUCKET_NAME

const remotePatterns = [
  {
    protocol: 'https',
    hostname: `${MEDIA_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`
  },
  {
    protocol: 'https',
    hostname: 'stage.codedang.com'
  },
  {
    protocol: 'https',
    hostname: 'skkuding.dev'
  }
]

/** * @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: process.env.NODE_ENV !== 'development'
  },
  images: {
    remotePatterns
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = withBundleAnalyzer(nextConfig)
