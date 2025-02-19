import { Button } from '@/components/shadcn/button'
import Link from 'next/link'
import type { ContestTop } from '../page'

export function PrevProblemButton(data: ContestTop) {
  return data.prev !== null ? (
    <Link href={`/contest/${data.prev.id}`}>
      <Button className="mb-0 mt-[18px] h-[54px] w-[1208px] justify-start rounded-b-none rounded-t-xl border border-[#80808040] bg-white pl-6 font-light text-black hover:bg-[#80808014]">
        <div className="flex flex-row">
          <p className="mr-6 w-[100px] text-left text-base font-semibold text-[#737373]">
            Previous
          </p>
          <p className="text-left text-base font-semibold text-[#737373]">
            {data.prev.title}
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
}
