import comingSoonLogo from '@/public/logos/coming-soon.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export default function AdminContestStatistics() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center justify-center py-[218px]">
      <Image
        className="pb-10"
        src={comingSoonLogo}
        alt={t('coming_soon_alt')}
        width={300}
        height={300}
      />
      <div className="flex flex-col items-center">
        <h2 className="pb-2 text-xl font-semibold">{t('coming_soon_title')}</h2>
        <p className="text-center text-base text-neutral-500">
          {t('page_preparation_message')}
        </p>
      </div>
    </div>
  )
}
