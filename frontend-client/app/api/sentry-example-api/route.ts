export const dynamic = 'force-dynamic'

// A faulty API route to test Sentry's error monitoring
export const GET = () => {
  throw new Error('Sentry Example API Route Error')
}
