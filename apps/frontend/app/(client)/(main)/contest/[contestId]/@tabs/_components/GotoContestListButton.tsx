import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export function GotoContestListButton() {
  return (
    <div className="mb-30 flex w-[1208px] justify-end">
      <Link href={`/contest`}>
        <Button className="mb-0 mt-5 h-[46px] w-[154px] rounded-[1000px] border border-[#D8D8D8] bg-white text-black hover:bg-[#80808014]">
          <p className="text-center text-base font-medium leading-[22.4px] tracking-[-0.48px]">
            Back to the List
          </p>
        </Button>
      </Link>
    </div>
  )
}
