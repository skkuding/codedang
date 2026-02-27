'use client'

import errorImage from '@/public/logos/error.webp'
import welcomeImage from '@/public/logos/welcome.png'
import Image from 'next/image'

interface LeaderboardErrorProps {
  type: 'beforeStart' | 'noData' | 'networkError'
}

export function LeaderboardError({ type }: LeaderboardErrorProps) {
  if (type === 'beforeStart') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt="error image" />
        <p className="text-head5_sb_24 ml-[70px] mt-[50px]">
          아직 콘테스트 시작 안했어요 ^~^
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          After contest, you can see the leaderboard.
        </p>
      </div>
    )
  } else if (type === 'networkError') {
    return (
      <div className="flex flex-col items-center pt-[100px]">
        <Image src={errorImage} alt="error image" />
        <p className="text-head5_sb_24 ml-[70px] mt-[50px]">
          Network Error Occurred
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          Please try reloading this page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pt-[100px]">
      <Image src={welcomeImage} alt="welcome image" />
      <p className="text-head5_sb_24 mt-[50px]">No Data Here</p>
      <p className="mt-2 text-[#00000080]">This leaderboard has no data</p>
    </div>
  )
}
