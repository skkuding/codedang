import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export function GotoContestListButton() {
  return (
    <div className="flex justify-end">
      <Link href={`/contest`}>
        <Button className="mb-0 mt-5 h-[42px] w-[136px] rounded-[1000px] border border-[#80808040] bg-white font-light text-black hover:bg-[#80808014]">
          <p className="w-[100px] text-center text-[14px] font-semibold">
            Back to the List
          </p>
        </Button>
      </Link>
    </div>
  )
}
