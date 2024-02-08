'use client'

import { Button } from '@/components/ui/button'
import ErrorImg from '@/public/error.webp'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error }: Props) {
  const router = useRouter()

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 py-12">
      <p className="mt-8 text-2xl font-extrabold">Something Went Wrong!</p>
      <p className="mb-4 max-w-[36rem] text-lg font-semibold">
        {error.message || 'Unknown Error'}
      </p>
      <Button variant="outline" onClick={router.refresh}>
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
