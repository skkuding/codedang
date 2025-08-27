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
    exclude: [/sw\.js$/, /workbox-(.)*\.js$/, /\.webmanifest$/]
  },
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) =>
        url.pathname === '/sw.js' || url.pathname.endsWith('.webmanifest'),
      handler: 'NetworkOnly',
      method: 'GET'
    }
  ]
})

const BUCKET_NAME = process.env.MEDIA_BUCKET_NAME

const nextConfig = {
  images: {
    remotePatterns: [
      new URL(`https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/**`), // production
      new URL('https://stage.codedang.com/**') // development
    ]
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ]
      },
      {
        source: '/:path*.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }
        ]
      }
    ]
  }
} satisfies NextConfig

export default withBundleAnalyzer(withPWA(nextConfig))
