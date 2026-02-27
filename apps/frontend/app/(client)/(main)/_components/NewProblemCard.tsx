import { Badge } from '@/components/shadcn/badge'
import { Card, CardContent } from '@/components/shadcn/card'
import GrayRightArrowIcon from '@/public/icons/arrow-right-gray.svg'
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
            <Badge variant={problem.difficulty}>
              Level {problem.difficulty.slice(-1)}
            </Badge>
            <h3 className="text-title1_sb_20 line-clamp-2 break-normal break-keep">
              {problem.title}
            </h3>
          </div>

          <Link href={`/problem/${problem.id}`}>
            <div className="flex h-12 items-center justify-between rounded-full bg-[#F5F5F5] py-1 pl-[50px] pr-1">
              <p className="text-sub2_m_18 text-[#737373]">Go to Problem</p>
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
      <Link href={`/problem/${problem.id}`}>
        <Card className="border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)] md:hidden">
          <CardContent className="flex h-[83px] flex-col justify-between gap-[6px] rounded-sm bg-white p-4">
            <div className="flex flex-col items-start gap-[6px]">
              <Badge
                variant={problem.difficulty}
                className="h-[21px] w-14 rounded-sm px-[6px] py-[2px] text-xs font-semibold"
              >
                <p className="h-[17px] w-11 text-center">
                  Level {problem.difficulty.slice(-1)}
                </p>
              </Badge>
              <div className="flex h-6 w-full justify-between">
                <p className="text-body1_m_16 truncate">{problem.title}</p>

                <Image
                  src={GrayRightArrowIcon}
                  alt="Right"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
