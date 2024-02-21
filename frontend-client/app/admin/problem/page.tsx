'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { columns } from './_components/Columns'

const GET_PROBLEMS = gql(`
  query GetProblems(
    $groupId: Int!
    $cursor: Int
    $take: Int!
    $input: FilterProblemsInput!
  ) {
    getProblems(
      groupId: $groupId
      cursor: $cursor
      take: $take
      input: $input
    ) {
      id
      title
      createTime
      difficulty
      submissionCount
      acceptedRate
      isVisible
      languages
      tag {
        id
        tag {
          id
          name
        }
      }
    }
  }
`)

export const dynamic = 'force-dynamic'

export default function Page() {
  const { data } = useQuery(GET_PROBLEMS, {
    variables: {
      groupId: 1,
      take: 20,
      input: {
        difficulty: [
          Level.Level1,
          Level.Level2,
          Level.Level3,
          Level.Level4,
          Level.Level5
        ],
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
      }
    }
  })

  const problems =
    data?.getProblems.map((problem) => ({
      ...problem,
      id: Number(problem.id),
      languages: problem.languages ?? [],
      problemTag: problem.tag.map(({ id, tag }) => ({
        id: +id,
        tag: {
          ...tag,
          id: +tag.id
        }
      }))
    })) ?? []

  return (
    <ScrollArea className="w-full">
      <div className="container mx-auto space-y-5 py-10">
        <div className="flex justify-between">
          <div>
            <p className="text-4xl font-bold">Problem List</p>
            <p className="flex text-lg text-slate-500">
              Here&apos;s a list you made
            </p>
          </div>
          <Link href="/admin/problem/create">
            <Button variant="default">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create
            </Button>
          </Link>
        </div>
        <DataTableAdmin columns={columns} data={problems} />
      </div>
    </ScrollArea>
  )
}
