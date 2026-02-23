'use client'

import { ErrorDetail } from '@/components/ErrorDetail'
import { captureError } from '@/libs/captureError'
import { useTranslate } from '@tolgee/react'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error }: Props) {
  const { t } = useTranslate()

  useEffect(() => {
    captureError(error)
  }, [error])

  return (
    <ErrorDetail
      errorDetail={t('error_detail_assignment_failure')}
      error={error}
    />
  )
}
