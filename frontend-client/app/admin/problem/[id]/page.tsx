'use client'

import { gql } from '@generated'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useQuery } from '@apollo/client'
import { sanitize } from 'isomorphic-dompurify'
import Link from 'next/link'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'

const GET_PROBLEM = gql(`
  query GetProblemDetail($groupId: Int!, $id: Int!) {
    getProblem(groupId: $groupId, id: $id) {
      title
      description
    }
  }
`)

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params

  const problemData = useQuery(GET_PROBLEM, {
    variables: {
      groupId: 1,
      id: +id
    }
  }).data?.getProblem

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
          <Link href={`/admin/problem/${id}/edit`}>
            <Button variant="default">
              <FaPencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
        <div
          className="prose w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
          dangerouslySetInnerHTML={{
            __html: sanitize(problemData?.description ?? '')
          }}
        />
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
