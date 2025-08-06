import { TextEditor } from '@/components/TextEditor'
import { Button } from '@/components/shadcn/button'
import type { ContestOrder } from '@/types/type'
import Link from 'next/link'

interface PrevNextProblemButtonProps {
  contestData: ContestOrder[]
  currentContestId: number
  previous: boolean
  search: string
}

export function DetailQna() {
  return (
    <div className="flex flex-col">
      <TextEditor placeholder="ew" onChange={() => {}} defaultValue="22" />
    </div>
  )
}
