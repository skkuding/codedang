import { Button } from '@/components/shadcn/button'
import Link from 'next/link'
import type { ContestTop } from '../page'

interface PrevNextProblemButtonProps {
  contestData: ContestTop
  prev: boolean
}

export function PrevNextProblemButton({
  contestData,
  prev
}: PrevNextProblemButtonProps) {
  if (prev) {
    return contestData.prev !== null ? (
      <Link href={`/contest/${contestData.prev.id}`}>
        <Button className="mb-0 mt-[18px] h-[54px] w-[1208px] justify-start rounded-b-none rounded-t-xl border border-[#80808040] bg-white pl-6 font-light text-black hover:bg-[#80808014]">
          <div className="flex flex-row">
            <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#737373]">
              Previous
            </p>
            <p className="text-left text-base font-semibold text-[#737373]">
              {contestData.prev.title}
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
          <p className="text-left text-base font-semibold text-[#737373]">
            No Previous Contest
          </p>
        </div>
      </Button>
    )
  } else {
    return contestData.next !== null ? (
      <Link href={`/contest/${contestData.next.id}`}>
        <Button className="mb-0 h-[54px] w-[1208px] justify-start rounded-b-xl rounded-t-none border border-t-0 border-[#80808040] bg-white pl-6 font-light text-black hover:bg-[#80808014]">
          <div className="flex flex-row">
            <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#3581FA]">
              Next
            </p>
            <p className="text-left text-base font-semibold">
              {contestData.next.title}
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
          <p className="text-left text-base font-semibold">No Next Contest</p>
        </div>
      </Button>
    )
  }
}
