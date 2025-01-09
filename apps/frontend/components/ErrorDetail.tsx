import { Button } from '@/components/shadcn/button'
import errorImg from '@/public/logos/error.webp'
import Image from 'next/image'

interface ErrorDetailProps {
  errorDetail: string
  error: Error & { digest?: string }
}

export default function Error({ errorDetail, error }: ErrorDetailProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 py-12">
      <p className="mt-8 text-2xl font-extrabold">{errorDetail}</p>
      <p className="mb-4 max-w-[36rem] text-lg font-semibold">
        {error.message || 'Unknown Error'}
      </p>
      <Button
        className="text-black"
        variant="outline"
        onClick={() => {
          window.location.reload()
        }}
      >
        Reload
      </Button>
      <Image
        src={errorImg}
        alt="Unexpected Error"
        height={240}
        className="mt-8"
      />
    </div>
  )
}
