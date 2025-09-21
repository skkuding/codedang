import { Button } from '@/components/shadcn/button'
import { Toggle } from '@/components/shadcn/toggle'
import Link from 'next/link'
//import { Suspense, useState, use } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="gap-15 flex flex-col items-start">
        <div className="flex flex-col items-start gap-[6px] self-stretch">
          <div className="flex w-full items-start gap-5">
            <span className="flex flex-1 text-[32px] font-bold">
              Question & Answer
            </span>
            <Button variant="default" className="w-[97px]" asChild>
              <Link href={`/admin/course` as const}>
                <HiMiniPlusCircle className="mr-2 h-5 w-5" />
                <span className="text-[16px]">Edit</span>
              </Link>
            </Button>
          </div>
          <span className="text-color-neutral-70 text-[16px]">
            Assignment와 Exercise 문제와 관련된 질문과 답변을 제공합니다.
          </span>
        </div>
        <div className="flex flex-col items-start gap-[30ox] self-stretch">
          <span className="text-[26px] font-semibold">Questions</span>
          <Toggle size="lg">Only show unanswered questions</Toggle>
        </div>
      </div>
    </div>
  )
}
