import * as Sentry from '@sentry/nextjs'

export const register = () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://10bd959e91328cfb75c274af2faa5fac@sentry.codedang.com/10',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false
    })
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://10bd959e91328cfb75c274af2faa5fac@sentry.codedang.com/10',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false
    })
  }
}
