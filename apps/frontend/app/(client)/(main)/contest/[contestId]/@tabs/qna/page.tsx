'use client'

import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export default function QnaPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-8">
      <h2 className="mb-6 text-2xl font-medium text-black">Q&A</h2>
      <Button className="h-[46px] px-6 py-3">
        <Link href="./qna/create">
          <span className="text-base font-medium text-white">
            Post New Question
          </span>
        </Link>
      </Button>
    </div>
  )
}
