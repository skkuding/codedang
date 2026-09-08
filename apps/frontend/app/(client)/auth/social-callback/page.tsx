'use client'

import { SocialLoginHandler } from '@/components/auth/SocialLoginHandler'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <SocialLoginHandler />
    </Suspense>
  )
}
