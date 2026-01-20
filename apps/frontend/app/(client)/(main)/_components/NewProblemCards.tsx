import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import GrayRightArrow from '@/public/icons/arrow-right-gray.svg'
import Image from 'next/image'
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
        <div className="hidden max-w-[1440px] flex-col items-start gap-5 px-[116px] md:flex">
          <Carousel className="flex w-full flex-col gap-10">
            <div className="flex w-full justify-between">
              <p className="text-3xl font-semibold leading-[36px] tracking-[-0.9px]">
                PRACTICE WITH CODING PROBLEMS
              </p>
              <div className="flex h-[30px] w-[78px] gap-[18px]">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </div>

            <div className="relative left-1/2 -my-8 -ml-2 w-screen -translate-x-1/2">
              <CarouselContent className="mx-[116px] my-8 max-w-[1224px] md:mx-auto">
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
                Go to Problem
              </p>
              <div className="relative size-[16px]">
                <Image src={GrayRightArrow} alt="Right" fill />
              </div>
            </div>
          </Link>
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
                  <Image src={GrayRightArrow} alt="Right" fill />
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
