'use client'

import { Button } from '@/components/shadcn/button'
import pleaseLogo from '@/public/logos/please.png'
import Image from 'next/image'

export default function StatisticsError() {
  return (
    <div className="flex flex-col items-center justify-center pb-[120px]">
      <Image className="mt-40" src={pleaseLogo} alt="coming-soon" width={336} />
      <div className="mt-5 text-lg text-gray-600">
        Statistics will be available after the contest ends.
      </div>
      <div className="text-body3_r_16 mt-2 text-gray-500">
        You can check the statistics after the contest ends and the leaderboard
        is unfrozen.
      </div>
      <Button className="mt-4" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  )
}
