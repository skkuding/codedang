import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const MEDIA_BUCKET_NAME = process.env.MEDIA_BUCKET_NAME

const nextConfig = {
  images: {
    remotePatterns: [
      new URL(`https://${MEDIA_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`), // production
      new URL('https://stage.codedang.com') // development
    ]
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  }
} satisfies NextConfig

export default withBundleAnalyzer(nextConfig)
