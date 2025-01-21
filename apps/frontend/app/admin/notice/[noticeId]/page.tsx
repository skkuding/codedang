'use client'

import { KatexContent } from '@/components/KatexContent'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_NOTICE } from '@/graphql/notice/queries'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { FaAngleLeft } from 'react-icons/fa6'

export default function Page({ params }: { params: { noticeId: string } }) {
  const { noticeId } = params

  const noticeData = useQuery(GET_NOTICE, {
    variables: {
      groupId: 1,
      noticeId: Number(noticeId)
    }
  }).data?.getNotice

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/notice">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">{noticeData?.title}</span>
          </div>
        </div>
        <KatexContent
          content={noticeData?.content}
          classname="prose mb-12 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
        />
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
