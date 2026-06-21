'use client'

import { LogInPage } from '@/components/auth/LogInPage/LogInPage'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <LogInPage />
    </Suspense>
  )
}
