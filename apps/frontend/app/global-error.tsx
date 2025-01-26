'use client'

import { captureError } from '@/libs/captureError'
import Error from 'next/error'
import { useEffect } from 'react'

interface Props {
  error: unknown
}

export default function GlobalError({ error }: Props) {
  useEffect(() => {
    captureError(error)
  }, [error])

  return (
    <html>
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  )
}
