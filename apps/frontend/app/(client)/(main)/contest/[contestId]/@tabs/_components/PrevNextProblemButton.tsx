import { Button } from '@/components/shadcn/button'
import type { ContestOrder } from '@/types/type'
import Link from 'next/link'

interface PrevNextProblemButtonProps {
  contestData: ContestOrder[]
  currentContestId: number
  previous: boolean
  search: string
}

export function PrevNextProblemButton({
  contestData,
  currentContestId,
  previous,
  search
}: PrevNextProblemButtonProps) {
  const currentIndex = contestData.findIndex(
    (data) => data.id === currentContestId
  )
  const finalIndex = contestData.length - 1
  if (previous) {
    return currentIndex !== 0 ? (
      <Link
        href={`/contest/${contestData[currentIndex - 1].id}${search ? `?search=${search}` : ''}`}
      >
        <Button className="border-line bg-fill hover:bg-fill mb-0 mt-10 h-[57px] w-[1208px] justify-start rounded-b-none rounded-t-[10px] border px-[24px] py-[16px] text-black">
          <div className="flex flex-row">
            <p className="mr-6 w-[100px] text-left text-lg font-medium leading-[25.2px] tracking-[-0.54px] text-black">
              Previous
            </p>
            <p className="truncate text-left text-base font-normal leading-[24px] tracking-[-0.48px] text-black">
              {contestData[currentIndex - 1].title}
            </p>
          </div>
        </Button>
      </Link>
    ) : (
      <Button className="border-line bg-fill hover:bg-fill pointer-events-none mb-0 mt-10 h-[57px] w-[1208px] justify-start rounded-b-none rounded-t-[10px] border px-[24px] py-[16px] text-black">
        <div className="flex flex-row">
          <p className="mr-6 w-[100px] text-left text-lg font-medium leading-[25.2px] tracking-[-0.54px] text-black">
            Previous
          </p>
          <p className="font-normal leading-[24px] tracking-[-0.48px] text-black">
            No Previous Contest
          </p>
        </div>
      </Button>
    )
  } else {
    return currentIndex !== finalIndex ? (
      <Link
        href={`/contest/${contestData[currentIndex + 1].id}${search ? `?search=${search}` : ''}`}
      >
        <Button className="border-line mb-0 h-[57px] w-[1208px] justify-start rounded-b-[10px] rounded-t-none border border-t-0 bg-white px-[24px] py-[16px] text-black hover:bg-white">
          <div className="flex flex-row">
            <p className="text-primary mr-6 w-[100px] text-left text-lg font-medium leading-[25.2px] tracking-[-0.54px]">
              Next
            </p>
            <p className="truncate text-left text-base font-normal leading-[24px] tracking-[-0.48px] text-black">
              {contestData[currentIndex + 1].title}
            </p>
          </div>
        </Button>
      </Link>
    ) : (
      <Button className="border-line pointer-events-none mb-0 h-[57px] w-[1208px] justify-start rounded-b-[10px] rounded-t-none border border-t-0 bg-white px-[24px] py-[16px] text-black hover:bg-white">
        <div className="flex flex-row">
          <p className="text-primary mr-6 w-[100px] text-left text-lg font-medium leading-[25.2px] tracking-[-0.54px]">
            Next
          </p>
          <p className="font-normal leading-[24px] tracking-[-0.48px] text-black">
            No Next Contest
          </p>
        </div>
      </Button>
    )
  }
}
