import { Badge } from '@/components/shadcn/badge'
import { Card, CardContent } from '@/components/shadcn/card'
import GrayRightArrowIcon from '@/public/icons/arrow-right-gray.svg'
import type { Problem } from '@/types/type'
import Link from 'next/link'

export function NewProblemCard({ problem }: { problem: Problem }) {
  return (
    <div>
      <Card className="hidden border-none shadow-[0_4px_20px_0_rgba(27,29,38,0.08)] md:flex">
        <CardContent className="flex h-[240px] w-[320px] flex-col justify-between rounded-2xl bg-white p-7">
          <div className="flex flex-col items-start gap-5">
            <Badge variant={problem.difficulty}>
              Level {problem.difficulty.slice(-1)}
            </Badge>
            <h3 className="text-head5_sb_24 line-clamp-2 w-full break-keep">
              {problem.title}
            </h3>
          </div>

          <Link href={`/problem/${problem.id}`}>
            <div className="flex h-[42px] w-[110px] items-center justify-center rounded-lg bg-black px-5 py-2">
              <p className="text-body1_m_16 whitespace-nowrap text-white">
                자세히 보기
              </p>
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
                <p className="truncate text-base font-medium">
                  {problem.title}
                </p>

                <GrayRightArrowIcon className="text-color-neutral-90 h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
