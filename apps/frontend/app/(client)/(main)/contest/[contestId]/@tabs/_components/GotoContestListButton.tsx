import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export function GotoContestListButton() {
  return (
    <div className="flex w-[1208px] justify-end">
      <Link href={`/contest`}>
        <Button className="mb-0 mt-5 h-[42px] w-[136px] rounded-full border border-[#D8D8D8] bg-[#F0F0F0] font-light text-black hover:bg-[#80808014]">
          <p className="w-[100px] text-center text-[14px] font-semibold leading-[22.4px] tracking-[-0.48px]">
            Back to the List
          </p>
        </Button>
      </Link>
    </div>
  )
}
