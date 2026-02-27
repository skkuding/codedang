import { Button } from '@/components/shadcn/button'
import errorImg from '@/public/logos/error.webp'
import { getTranslate } from '@/tolgee/server'
import Image from 'next/image'

interface ErrorDetailProps {
  errorDetail: string
  error: Error & { digest?: string }
}

export async function ErrorDetail({ errorDetail, error }: ErrorDetailProps) {
  const t = await getTranslate()

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 py-12">
      <p className="mt-8 text-2xl font-extrabold">{errorDetail}</p>
      <p className="mb-4 max-w-xl text-lg font-semibold">
        {error.message || t('unknown_error')}
      </p>
      <Button
        className="text-black"
        variant="outline"
        onClick={() => {
          window.location.reload()
        }}
      >
        {t('reload_button')}
      </Button>
      <Image
        src={errorImg}
        alt={t('unexpected_error_alt')}
        height={240}
        className="mt-8"
      />
    </div>
  )
}
