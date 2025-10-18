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

  buildExcludes: [/\/_next\/static\/chunks\/app\/.*\/page-.*\.js$/],

  workboxOptions: {
    disableDevLogs: true,
    exclude: [
      /sw\.js$/,
      /workbox-.*\.js$/,
      /\.webmanifest$/,
      /\/worker-.*\.js$/,
      /\/_next\/static\/chunks\/app\/.*\/page-.*\.js$/
    ],

    manifestTransforms: [
      async (entries: { url: string; revision?: string }[]) => {
        const re = /\/_next\/static\/chunks\/app\/.*\/page-.*\.js$/
        const filtered = entries.filter((e) => {
          // e.url은 %5BcontestId%5D 처럼 인코딩되어 들어올 수 있음
          const u = decodeURIComponent(e.url)
          return !re.test(u)
        })
        return { manifest: filtered, warnings: [] }
      }
    ]
  },

  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) =>
        url.pathname === '/sw.js' ||
        url.pathname.endsWith('.webmanifest') ||
        url.pathname.startsWith('/worker-'),
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
      new URL('https://stage.codedang.com/**'), // development
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
