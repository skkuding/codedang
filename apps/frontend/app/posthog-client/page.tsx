'use client'

import { useFeatureFlag } from '@/libs/hooks/useFeatureFlag'

export default function Page() {
  const flag = useFeatureFlag('test2')

  return (
    <main>
      <h1>Next.js A/B tests</h1>
      <button type="button" id="main-cta">
        {flag ? 'Click this button for free money' : 'Click me'}
      </button>
    </main>
  )
}
