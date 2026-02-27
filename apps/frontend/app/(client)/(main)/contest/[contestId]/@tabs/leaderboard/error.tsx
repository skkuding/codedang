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
        <p className="text-head5_sb_24 ml-[70px] mt-[50px]">
          The contest hasn&apos;t started yet. ^~^
        </p>
        <p className="ml-[70px] mt-2 text-[#00000080]">
          After contest, you can see the leaderboard.
        </p>
      </div>
    )
  } else if (errorContent === 'ongoing') {
    return (
      <div className="flex flex-col items-center pb-[245px] pt-[245px]">
        <Image src={welcomeImage} alt="welcome_image" />
        <p className="text-head5_sb_24 mt-[50px]">Contest Hasn’t Ended </p>
        <p className="mt-2 text-[#00000080]">
          The leaderboard will be released after the end of the contest
        </p>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center pb-[245px] pt-[245px]">
        <Image src={welcomeImage} alt="welcome_image" />
        <p className="text-head5_sb_24 mt-[50px]">No Data Here </p>
        <p className="mt-2 text-[#00000080]">This leaderboard has no Data</p>
      </div>
    )
  }
}
