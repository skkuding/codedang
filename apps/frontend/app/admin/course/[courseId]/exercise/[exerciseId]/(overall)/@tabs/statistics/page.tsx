import comingSoonLogo from '@/public/logos/coming-soon.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export default function Page() {
  const { t } = useTranslate()
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex flex-col items-center justify-center py-[218px]">
        <Image
          className="pb-10"
          src={comingSoonLogo}
          alt="coming-soon"
          width={300}
          height={300}
        />
        <div className="flex flex-col items-center">
          <h2 className="pb-2 text-xl font-semibold">
            {t('coming_soon_heading')}
          </h2>
          <p className="text-center text-base text-neutral-500">
            {t('page_preparation_message')}
            <br /> {t('update_soon_message')}
          </p>
        </div>
      </div>
    </div>
  )
}
