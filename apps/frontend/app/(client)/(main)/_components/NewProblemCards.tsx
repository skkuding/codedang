import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import RightArrowIcon from '@/public/icons/arrow-right.svg'
import Link from 'next/link'
import { getProblemList } from '../../_libs/apis/problem'
import { NewProblemCard } from './NewProblemCard'

export async function NewProblemCards() {
  const { data: problems } = await getProblemList({
    order: 'submit-desc',
    take: 6
  })
  const mobileProblems = problems.slice(0, 3)

  return (
    problems.length > 0 && (
      <div className="relative w-full">
        {/* Desktop View */}
        <div className="hidden max-w-[1440px] flex-col items-start gap-7 md:flex">
          <Carousel className="flex w-full flex-col">
            <div className="flex w-full justify-between">
              <p className="text-head1_b_40">최신 코딩 문제를 연습해보세요</p>
              <div className="flex h-[30px] w-[78px] gap-[18px]">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </div>

            <CarouselContent className="mx-0 my-8">
              {problems.map((problem) => (
                <CarouselItem key={problem.id}>
                  <NewProblemCard problem={problem} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        {/* Desktop View */}
        <div className="flex w-full flex-col gap-4 px-5 py-[30px] md:hidden">
          <div className="flex justify-between">
            <div className="text-xl font-semibold">
              <p>PRACTICE WITH</p>
              <p>CODING PROBLEMS</p>
            </div>
            <Link href={'/problem'}>
              <div className="flex items-center justify-center gap-[2px] border-[#B0B0B0]">
                <p className="text-color-neutral-50 flex h-[17px] items-center text-xs font-normal leading-[22.4px] tracking-[-0.03rem]">
                  Go to Problem
                </p>
                <div className="relative size-[12px]">
                  <RightArrowIcon className="text-color-neutral-90 h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
          <div className="flex flex-col gap-[6px]">
            {mobileProblems.map((problem) => (
              <NewProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </div>
      </div>
    )
  )
}
