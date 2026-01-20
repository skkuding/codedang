import { LevelBadge } from '@/components/LevelBadge'
import { Card, CardContent } from '@/components/shadcn/card'
import GrayRightArrow from '@/public/icons/arrow-right-gray.svg'
import RightArrow from '@/public/icons/arrow-right-white.svg'
import type { Problem } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'

export function NewProblemCard({ problem }: { problem: Problem }) {
  return (
    <div>
      <Card className="hidden border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)] md:flex">
        <CardContent className="flex h-[340px] w-[300px] flex-col justify-between rounded-xl bg-white p-7">
          <div className="flex flex-col items-start gap-10">
            <LevelBadge level={problem.difficulty} />
            <h3 className="line-clamp-2 break-normal break-keep text-xl font-semibold">
              {problem.title}
            </h3>
          </div>

          <Link href={`/problem/${problem.id}`}>
            <div className="flex h-12 items-center justify-between rounded-full bg-[#F5F5F5] py-1 pl-[50px] pr-1">
              <p className="text-[18px] font-medium tracking-[-0.54px] text-[#737373]">
                Go to Problem
              </p>
              <div className="flex items-center gap-2.5 rounded-full bg-black p-2">
                <div className="relative size-[24px]">
                  <Image src={RightArrow} alt="Right" fill />
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
      {/* Mobile Card */}
      <Card className="border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)] md:hidden">
        <CardContent className="flex h-[83px] w-full flex-col justify-between gap-[6px] rounded-sm bg-white p-4">
          <LevelBadge level={problem.difficulty} className="rounded-sm" />
          <div className="flex h-6 justify-between">
            <p className="truncate text-base font-normal">{problem.title}</p>
            <Link href={`/problem/${problem.id}`}>
              <div className="flex h-6 items-center">
                <Image
                  src={GrayRightArrow}
                  alt="Right"
                  width={16}
                  height={16}
                />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
