'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
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
      updateTime
      difficulty
      submissionCount
      acceptedRate
      isVisible
      languages
      problemTag {
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
  const { data, loading } = useQuery(GET_PROBLEMS, {
    variables: {
      groupId: 1,
      cursor: 1,
      take: 100,
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
      problemTag: problem.problemTag.map(({ id, tag }) => ({
        id: +id,
        tag: {
          ...tag,
          id: +tag.id
        }
      }))
    })) ?? []

  return (
    <ScrollArea className="w-full">
      <div className="px-20 py-16">
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
        {loading ? (
          <>
            <div className="mb-16 flex gap-4">
              <span className="w-2/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
            </div>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
          </>
        ) : (
          <DataTableAdmin columns={columns} data={problems} />
        )}
      </div>
    </ScrollArea>
  )
}
