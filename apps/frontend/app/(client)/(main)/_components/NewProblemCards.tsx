import {Button} from '@/components/shadcn/button'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/shadcn/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { Card, CardContent } from '@/components/shadcn/card'
import type { Level } from '@/types/type'
import GrayRightArrow from '@/public/icons/GrayRightArrow.svg'
import RightArrow from '@/public/icons/RightArrow.svg'
import { getProblemList } from '../../_libs/apis/problem'

const { data: problems } = await getProblemList({
  order: 'id-asc'
})

export function NewProblemCards() {
  return (
    problems.length > 0 && (
      <div className="flex flex-col items-start gap-5 pl-[116px] w-screen 2xl:ml-[240px]">
        <Carousel className="flex w-full flex-col gap-10">
          <div className="flex w-full justify-between pr-[116px]">
            <p className="text-3xl font-semibold leading-[36px] tracking-[-0.9px]">
              PRACTICE WITH CODING PROBLEMS
            </p>
            <div className="flex h-[30px] w-[78px] gap-[18px] 2xl:mr-[240px]">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>

          {/* NOTE: Outer div wrapper added to prevent card shadow from being clipped */}
          {/* Set z-index to negative to ensure that elements remain clickable */}
          <div className="-ml-24 -my-24 z-[-10]">
            <CarouselContent className="ml-20 my-24">
              {problems.map((problem) => (
                <CarouselItem key={problem.id}>
                  <NewProblemCard problem={problem} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>

        <Link href={'/problem'}>
          <div className="flex items-center justify-center gap-[2px] py-[4px] border-b border-[#B0B0B0]">
            <p className="font-pretendard flex h-8 items-center text-[16px] font-medium leading-[22.4px] tracking-[-0.48px] text-[#5C5C5C]">
              Go to Problem
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

function NewProblemCard({
  problem
}: {
  problem: { id: number; title: string; difficulty: string }
}) {
  return (
    <Card className="border-none shadow-[3px_3px_20px_0_rgba(17,17,17,0.1)]">
      <CardContent className="flex h-[340px] w-[300px] flex-col justify-between rounded-xl bg-white p-7">
        <div className="flex flex-col items-start gap-10">
          <Badge
            variant={problem.difficulty as Level}
            className="mb-2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium capitalize"
          >
            Level {problem.difficulty.slice(-1)}
          </Badge>
          <h3 className="text-lg font-semibold line-clamp-2 break-normal break-keep">{problem.title}</h3>
        </div>

        <Link href={`/problem/${problem.id}`}>
          <div className="flex h-12 items-center justify-between rounded-full bg-[#F5F5F5] pr-1 py-1 pl-[50px]">
            <p className="text-[18px] font-medium leading-[140%] tracking-[-0.54px] text-[#737373]">
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
  )
}
