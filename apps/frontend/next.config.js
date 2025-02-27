const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
/** @type {import('next').NextConfig} */
const MEDIA_BUCKET_NAME = process.env.MEDIA_BUCKET_NAME

// const domains =
//   process.env.NODE_ENV === 'production'
//     ? [`${MEDIA_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`]
//     : ['stage.codedang.com', 'skkuding.dev']

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

const nextConfig = {
  experimental: {
    typedRoutes: process.env.NODE_ENV !== 'development',
    instrumentationHook: process.env.NODE_ENV !== 'development'
  },
  images: {
    remotePatterns
  },
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // Custom Webpack Config
  webpack: (config, { webpack }) => {
    // NOTE: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/
    config.plugins.push(
      new webpack.DefinePlugin({
        __SENTRY_DEBUG__: false,
        __SENTRY_TRACING__: false,
        __RRWEB_EXCLUDE_IFRAME__: true,
        __RRWEB_EXCLUDE_SHADOW_DOM__: true,
        __SENTRY_EXCLUDE_REPLAY_WORKER__: true
      })
    )

    // return the modified config
    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)
