import { LevelBadge } from '@/components/LevelBadge'
import { Card, CardContent } from '@/components/shadcn/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import GrayRightArrow from '@/public/icons/arrow-right-gray.svg'
import RightArrow from '@/public/icons/arrow-right-white.svg'
import { getTranslate } from '@/tolgee/server'
import type { Problem } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import { getProblemList } from '../../_libs/apis/problem'

export async function NewProblemCards() {
  const t = await getTranslate()
  const { data: problems } = await getProblemList({
    order: 'submit-desc',
    take: 6
  })

  return (
    problems.length > 0 && (
      <div className="flex w-full max-w-[1440px] flex-col items-start gap-5 px-[116px]">
        <Carousel className="flex w-full flex-col gap-10">
          <div className="flex w-full justify-between">
            <p className="text-3xl font-semibold leading-[36px] tracking-[-0.9px]">
              {t('practice_with_coding_problems')}
            </p>
            <div className="flex h-[30px] w-[78px] gap-[18px]">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>

          <div className="relative left-1/2 -my-8 -ml-2 w-screen -translate-x-1/2">
            <CarouselContent className="mx-[116px] my-8 max-w-[1224px] lg:mx-auto">
              {problems.map((problem) => (
                <CarouselItem key={problem.id}>
                  <NewProblemCard problem={problem} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>

        <Link href={'/problem'}>
          <div className="flex items-center justify-center gap-[2px] border-b border-[#B0B0B0] py-[4px]">
            <p className="font-pretendard flex h-8 items-center text-[16px] font-medium leading-[22.4px] tracking-[-0.48px] text-[#5C5C5C]">
              {t('go_to_problem')}
            </p>
            <div className="relative size-[16px]">
              <Image src={GrayRightArrow} alt="Right" fill />
            </div>
          </div>
        </Link>
      </div>
    )
  )
}

function NewProblemCard({ problem }: { problem: Problem }) {
  const { t } = useTranslate()
  return (
    <Card className="border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)]">
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
  )
}
