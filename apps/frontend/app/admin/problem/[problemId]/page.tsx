'use client'

import KatexContent from '@/components/KatexContent'
import Paginator from '@/components/Paginator'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { GET_PROBLEM_DETAIL } from '@/graphql/problem/queries'
import { usePagination } from '@/lib/pagination'
import type { SubmissionItem } from '@/types/type'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

export default function Page({ params }: { params: { problemId: string } }) {
  const { problemId } = params

  const problemData = useQuery(GET_PROBLEM_DETAIL, {
    variables: {
      groupId: 1,
      id: Number(problemId)
    }
  }).data?.getProblem

  const { items, paginator } = usePagination<SubmissionItem>(
    `submission?problemId=${problemId}`,
    20
  )

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/problem">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">{problemData?.title}</span>
          </div>
          <Link href={`/admin/problem/${problemId}/edit`}>
            <Button variant="default">
              <FaPencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
        <KatexContent
          content={problemData?.description}
          classname="prose mb-12 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
        />

        <p className="text-xl font-bold">Submission</p>
        <DataTable
          data={items ?? []}
          columns={columns}
          headerStyle={{
            id: 'w-[8%]',
            username: 'w-[15%]',
            result: 'w-[27%]',
            language: 'w-[14%]',
            createTime: 'w-[23%]',
            codeSize: 'w-[13%]'
          }}
          problemId={Number(problemId)}
        />
        <Paginator page={paginator.page} slot={paginator.slot} />
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
