'use client'

import welcomeImage from '@/public/logos/welcome.png'
import Image from 'next/image'

export default function LeaderboardErrorPage() {
  return (
    <div className="flex flex-col items-center pt-[100px]">
      <Image src={welcomeImage} alt="welcome_image" />
      <p className="mt-[50px] text-2xl font-semibold">Contest Hasn’t Ended </p>
      <p className="mt-2 text-[#00000080]">
        The leaderboard will be released after the end of the contest
      </p>
    </div>
  )
}
