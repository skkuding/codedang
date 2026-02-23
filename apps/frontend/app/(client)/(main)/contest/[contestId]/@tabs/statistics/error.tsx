'use client'

import { Button } from '@/components/shadcn/button'
import pleaseLogo from '@/public/logos/please.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export default function StatisticsError() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center justify-center pb-[120px]">
      <Image
        className="mt-40"
        src={pleaseLogo}
        alt={t('coming_soon')}
        width={336}
      />
      <div className="mt-5 text-lg text-gray-600">
        {t('statistics_unavailable')}
      </div>
      <div className="mt-2 text-base text-gray-500">
        {t('check_statistics_after_contest')}
      </div>
      <Button className="mt-4" onClick={() => window.location.reload()}>
        {t('refresh_button')}
      </Button>
    </div>
  )
}
