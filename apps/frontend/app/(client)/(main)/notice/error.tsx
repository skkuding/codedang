'use client'

import { ErrorDetail } from '@/components/ErrorDetail'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error }: Props) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return <ErrorDetail errorDetail="Failed to Load Notice!" error={error} />
}
