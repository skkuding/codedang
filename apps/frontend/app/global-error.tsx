'use client'

import { captureException } from '@sentry/nextjs'
import Error from 'next/error'
import { useEffect } from 'react'

interface Props {
  error: unknown
}

export default function GlobalError({ error }: Props) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  )
}
