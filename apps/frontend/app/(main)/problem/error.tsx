'use client'

import { Button } from '@/components/ui/button'
import ErrorImg from '@/public/error.webp'
import { captureException } from '@sentry/nextjs'
import Image from 'next/image'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error }: Props) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 py-12">
      <p className="mt-8 text-2xl font-extrabold">
        Failed to load problem resource!
      </p>
      <p className="mb-4 max-w-[36rem] text-lg font-semibold">
        {error.message || 'Unknown Error'}
      </p>
      <Button
        variant="outline"
        onClick={() => {
          window.location.reload()
        }}
      >
        Reload
      </Button>
      <Image
        src={ErrorImg}
        alt="Unexpected Error"
        height={240}
        className="mt-8"
      />
    </div>
  )
}
