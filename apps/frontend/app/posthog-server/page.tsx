import { getFeatureFlag } from '@/libs/posthog.server'

export default async function Page() {
  const flag = await getFeatureFlag('test2')

  return (
    <main>
      <h1>Next.js A/B tests</h1>
      <button type="button" id="main-cta">
        {flag ? 'Click this button for free money' : 'Click me'}
      </button>
    </main>
  )
}
