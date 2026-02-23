'use client'

import errorImage from '@/public/logos/error.webp'
import welcomeImage from '@/public/logos/welcome.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

interface LeaderboardErrorProps {
  type: 'beforeStart' | 'noData' | 'networkError'
}

export function LeaderboardError({ type }: LeaderboardErrorProps) {
  const { t } = useTranslate()
  if (type === 'beforeStart') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt={t('error_image_alt')} />
        <p className="ml-[70px] mt-[50px] text-2xl font-semibold">
          {t('before_start_message')}
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          {t('before_start_info')}
        </p>
      </div>
    )
  } else if (type === 'networkError') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt={t('error_image_alt')} />
        <p className="ml-[70px] mt-[50px] text-2xl font-semibold">
          {t('network_error_occurred')}
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          {t('please_try_reloading')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pt-[100px]">
      <Image src={welcomeImage} alt={t('welcome_image_alt')} />
      <p className="mt-[50px] text-2xl font-semibold">{t('no_data_here')}</p>
      <p className="mt-2 text-[#00000080]">{t('no_data_info')}</p>
    </div>
  )
}
