import { captureRequestError } from '@sentry/nextjs'

// Errors only. Server traces belong to Grafana, so tracesSampleRate stays
// unset and no spans are sent to Sentry.
const options = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT
}

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init, serveTunnelIntegration } = await import('@sentry/nextjs')
    init({
      ...options,
      // Forwards browser events sent with `tunnel: true` to Sentry. Answers
      // before the request reaches Next.js, so middleware does not run.
      integrations: [serveTunnelIntegration()]
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs')
    init(options)
  }
}

// Reports errors thrown while rendering on the server (Server Components,
// route handlers, middleware).
export const onRequestError = captureRequestError
