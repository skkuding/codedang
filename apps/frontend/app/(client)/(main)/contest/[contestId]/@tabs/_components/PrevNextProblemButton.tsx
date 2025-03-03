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
        <Button className="mb-0 mt-[18px] h-[54px] w-[1208px] justify-start rounded-b-none rounded-t-xl border border-[#80808040] bg-white pl-6 font-light text-black hover:bg-[#80808014]">
          <div className="flex flex-row">
            <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#737373]">
              Previous
            </p>
            <p className="w-[1020px] truncate text-left text-base font-medium text-[#737373]">
              {contestData[currentIndex - 1].title}
            </p>
          </div>
        </Button>
      </Link>
    ) : (
      <Button className="pointer-events-none mb-0 mt-14 h-[54px] w-[1208px] justify-start rounded-b-none rounded-t-xl border border-[#80808040] bg-white pl-6 font-light text-black hover:bg-white">
        <div className="flex flex-row">
          <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#737373]">
            Previous
          </p>
          <p className="text-left text-base font-medium text-[#737373]">
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
        <Button className="mb-0 h-[54px] w-[1208px] justify-start rounded-b-xl rounded-t-none border border-t-0 border-[#80808040] bg-white pl-6 font-light text-black hover:bg-[#80808014]">
          <div className="flex flex-row">
            <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#3581FA]">
              Next
            </p>
            <p className="w-[1020px] truncate text-left text-base font-medium">
              {contestData[currentIndex + 1].title}
            </p>
          </div>
        </Button>
      </Link>
    ) : (
      <Button className="pointer-events-none mb-0 h-[54px] w-[1208px] justify-start rounded-b-xl rounded-t-none border border-t-0 border-[#80808040] bg-white pl-6 font-light text-black hover:bg-white">
        <div className="flex flex-row">
          <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#3581FA]">
            Next
          </p>
          <p className="text-left text-base font-medium">No Next Contest</p>
        </div>
      </Button>
    )
  }
}
