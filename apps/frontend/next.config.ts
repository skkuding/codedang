import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import path from 'path'

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
      {
        protocol: 'https',
        hostname: `${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`
      },
      {
        protocol: 'https',
        hostname: 'minio.stage.codedang.com'
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com'
      }
    ]
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  turbopack: {
    rules: {
      './public/icons/*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    )

    if (fileLoaderRule) {
      fileLoaderRule.exclude = (resourcePath: string) => {
        return /\.svg$/i.test(resourcePath)
      }
    }

    // public/icons: SVGR로 처리 (React component)
    config.module.rules.push({
      test: /\.svg$/i,
      include: path.resolve(__dirname, 'public/icons'),
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            ext: 'tsx'
          }
        }
      ]
    })

    // public/icons 제외한 다른 SVG: URL asset으로 처리
    config.module.rules.push({
      test: /\.svg$/i,
      exclude: path.resolve(__dirname, 'public/icons'),
      type: 'asset/resource'
    })

    return config
  }
} satisfies NextConfig

export default withBundleAnalyzer(withPWA(nextConfig))
