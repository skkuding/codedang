import { init } from '@sentry/nextjs'

// Errors only. Tracing is not enabled here (no tracesSampleRate).
init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  // Send events to a same-origin path served by the Next server
  // (serveTunnelIntegration in instrumentation.ts), so ad blockers that block
  // sentry.io do not drop them.
  tunnel: true
})
