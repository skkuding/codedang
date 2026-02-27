import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export function GotoContestListButton() {
  return (
    <div className="mb-30 flex w-[1208px] justify-end">
      <Link href={`/contest`}>
        <Button className="border-line mb-0 mt-5 h-[46px] w-[154px] rounded-[1000px] border bg-white text-black">
          <p className="text-body1_m_16 text-center">Back to the List</p>
        </Button>
      </Link>
    </div>
  )
}
