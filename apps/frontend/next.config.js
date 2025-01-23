const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
require('dotenv').config({ path: '../../.env' })
/** @type {import('next').NextConfig} */
const APP_ENV = process.env.APP_ENV //|| 'local'
const MEDIA_BUCKET_NAME = process.env.MEDIA_BUCKET_NAME
const STORAGE_BUCKET_ENDPOINT_URL = process.env.STORAGE_BUCKET_ENDPOINT_URL

const domains =
  APP_ENV === 'production'
    ? [`${MEDIA_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`]
    : APP_ENV === 'stage'
      ? ['stage.codedang.com']
      : ['stage.codedang.com']
// : [STORAGE_BUCKET_ENDPOINT_URL, 'stage.codedang.com']

const nextConfig = {
  experimental: {
    typedRoutes: process.env.NODE_ENV !== 'development',
    instrumentationHook: process.env.NODE_ENV !== 'development'
  },
  images: {
    domains
  },
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
}

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: 'skkuding',
  project: process.env.SENTRY_PROJECT,
  sentryUrl: 'https://sentry.codedang.com',
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true
}

module.exports =
  process.env.NODE_ENV === 'development'
    ? withBundleAnalyzer(nextConfig)
    : withSentryConfig(withBundleAnalyzer(nextConfig), sentryConfig)
