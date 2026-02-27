'use client'

import errorImage from '@/public/logos/error.webp'
import welcomeImage from '@/public/logos/welcome.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export default function LeaderboardErrorPage({ error }: { error: Error }) {
  const { t } = useTranslate()
  const errorContent = error.message.split('(')[1].split(')')[0]
  if (errorContent === 'before start') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt="error image" />
        <p className="ml-[70px] mt-[50px] text-2xl font-semibold">
          {t('contest_hasnt_started_yet_message')}
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          {t('after_contest_leaderboard_message')}
        </p>
      </div>
    )
  } else if (errorContent === 'ongoing') {
    return (
      <div className="flex flex-col items-center pb-[245px] pt-[245px]">
        <Image src={welcomeImage} alt="welcome_image" />
        <p className="mt-[50px] text-2xl font-semibold">
          {t('contest_hasnt_ended_message')}
        </p>
        <p className="mt-2 text-[#00000080]">
          {t('leaderboard_release_message')}
        </p>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center pb-[245px] pt-[245px]">
        <Image src={welcomeImage} alt="welcome_image" />
        <p className="mt-[50px] text-2xl font-semibold">
          {t('no_data_here_message')}
        </p>
        <p className="mt-2 text-[#00000080]">
          {t('no_data_leaderboard_message')}
        </p>
      </div>
    )
  }
}
