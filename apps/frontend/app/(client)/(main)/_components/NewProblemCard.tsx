import { Badge } from '@/components/shadcn/badge'
import { Card, CardContent } from '@/components/shadcn/card'
import GrayRightArrowIcon from '@/public/icons/arrow-right-gray.svg'
import RightArrow from '@/public/icons/arrow-right-white.svg'
import { getTranslate } from '@/tolgee/server'
import type { Problem } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'

export async function NewProblemCard({ problem }: { problem: Problem }) {
  const t = await getTranslate()
  return (
    <div>
      <Card className="hidden border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)] md:flex">
        <CardContent className="flex h-[340px] w-[300px] flex-col justify-between rounded-xl bg-white p-7">
          <div className="flex flex-col items-start gap-10">
            <Badge variant={problem.difficulty}>
              {t('level_label', { level: problem.difficulty.slice(-1) })}
            </Badge>
            <h3 className="line-clamp-2 break-normal break-keep text-xl font-semibold">
              {problem.title}
            </h3>
          </div>

          <Link href={`/problem/${problem.id}`}>
            <div className="flex h-12 items-center justify-between rounded-full bg-[#F5F5F5] py-1 pl-[50px] pr-1">
              <p className="text-[18px] font-medium tracking-[-0.54px] text-[#737373]">
                {t('go_to_problem')}
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
      <Link href={`/problem/${problem.id}`}>
        <Card className="border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)] md:hidden">
          <CardContent className="flex h-[83px] flex-col justify-between gap-[6px] rounded-sm bg-white p-4">
            <div className="flex flex-col items-start gap-[6px]">
              <Badge
                variant={problem.difficulty}
                className="h-[21px] w-14 rounded-sm px-[6px] py-[2px] text-xs font-semibold"
              >
                <p className="h-[17px] w-11 text-center">
                  {t('level_label', { level: problem.difficulty.slice(-1) })}
                </p>
              </Badge>
              <div className="flex h-6 w-full justify-between">
                <p className="truncate text-base font-medium">
                  {problem.title}
                </p>

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
