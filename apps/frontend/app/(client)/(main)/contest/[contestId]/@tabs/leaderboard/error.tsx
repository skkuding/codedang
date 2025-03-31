'use client'

import errorImage from '@/public/logos/error.webp'
import welcomeImage from '@/public/logos/welcome.png'
import Image from 'next/image'

export default function LeaderboardErrorPage({ error }: { error: Error }) {
  const errorContent = error.message.split('(')[1].split(')')[0]
  if (errorContent === 'before start') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt="error image" />
        <p className="ml-[70px] mt-[50px] text-2xl font-semibold">
          아직 콘테스트 시작 안했어요 ^~^
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          After contest, you can see the leaderboard.
        </p>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center pb-[245px] pt-[245px]">
        <Image src={welcomeImage} alt="welcome_image" />
        <p className="mt-[50px] text-2xl font-semibold">
          Contest Hasn’t Ended{' '}
        </p>
        <p className="mt-2 text-[#00000080]">
          The leaderboard will be released after the end of the contest
        </p>
      </div>
    )
  }
}
