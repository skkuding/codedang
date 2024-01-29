'use client'

import { Button } from '@/components/ui/button'
import ErrorImg from '@/public/error.webp'
import Image from 'next/image'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3">
      <p className="mt-8 text-2xl font-extrabold">Something Went Wrong!</p>
      <p className="mb-4 text-lg font-semibold">
        {error.message || 'Unknown Error'}
      </p>
      <Button variant="outline" onClick={reset}>
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
