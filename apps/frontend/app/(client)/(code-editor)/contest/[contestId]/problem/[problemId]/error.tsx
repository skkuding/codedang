'use client'

import ErrorDetail from '@/components/ErrorDetail'
import { captureError } from '@/libs/captureError'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error }: Props) {
  useEffect(() => {
    captureError(error)
  }, [error])

  return (
    <ErrorDetail
      errorDetail="Failed to Load Problem Description!"
      error={error}
    />
  )
}
