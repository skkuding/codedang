import { init } from '@sentry/nextjs'

export const register = () => {
  if (['nodejs', 'edge'].includes(process.env.NEXT_RUNTIME ?? '')) {
    init({
      dsn: 'https://e7ad1fd7113c361ca7e511afc732c5ed@sentry.codedang.com/2',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false
    })
  }
}
