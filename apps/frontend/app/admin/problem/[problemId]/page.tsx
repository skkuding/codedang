'use client'

import { KatexContent } from '@/components/KatexContent'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_PROBLEM_DETAIL } from '@/graphql/problem/queries'
import { GET_SUBMISSIONS } from '@/graphql/submission/queries'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { FaAngleLeft, FaEye, FaPencil } from 'react-icons/fa6'
import {
  DataTable,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import { columns } from './_components/Columns'

export default function Page({ params }: { params: { problemId: string } }) {
  const { problemId } = params

  const problemData = useQuery(GET_PROBLEM_DETAIL, {
    variables: {
      id: Number(problemId)
    }
  }).data?.getProblem

  const submissions =
    useQuery(GET_SUBMISSIONS, {
      variables: {
        problemId: Number(problemId)
      }
    }).data?.getSubmissions?.data.map((submission) => ({
      id: Number(submission.id),
      username: submission.user?.username ?? '',
      result: submission.result,
      language: submission.language,
      createTime: submission.createTime ?? '',
      codeSize: submission.codeSize ?? 0
    })) ?? []

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
          <div className="flex gap-2">
            <Link href={`/admin/problem/${problemId}/preview`}>
              <Button variant="slate" className="bg-slate-200">
                <FaEye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Link href={`/admin/problem/${problemId}/edit`}>
              <Button variant="default">
                <FaPencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
        <KatexContent
          content={problemData?.description}
          classname="prose mb-12 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
        />

        <p className="text-xl font-bold">Submission</p>
        <DataTableRoot
          data={submissions}
          columns={columns}
          defaultSortState={[{ id: 'updateTime', desc: true }]}
        >
          <div className="flex gap-4">
            <DataTableSearchBar columndId="title" />
          </div>
          <DataTable getHref={(data) => `/admin/problem/${data.id}`} />
          <DataTablePagination showSelection />
        </DataTableRoot>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
