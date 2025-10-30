import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  customWorkerDir: 'worker',
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/.*/]
  }
})

const BUCKET_NAME = process.env.MEDIA_BUCKET_NAME

const nextConfig = {
  images: {
    remotePatterns: [
      new URL(`https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/**`), // production
      new URL('https://minio.minio.svc.cluster.local/**'), // stage server-side
      new URL('https://minio.stage.codedang.com/**'), // stage client-side
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com'
      }
    ]
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  }
} satisfies NextConfig

export default withBundleAnalyzer(withPWA(nextConfig))
