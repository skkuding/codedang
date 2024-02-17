'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { fetcherGql } from '@/lib/utils'
import { gql } from '@apollo/client'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { columns } from './_components/Columns'

interface Tag {
  id: number
  name: string
}

interface DataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  isVisible: boolean
  languages: string[]
  problemTag: { id: number; tag: Tag }[]
}

const GET_PROBLEMS = gql`
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
`

export const dynamic = 'force-dynamic'

export default function Page() {
  const [problems, setProblems] = useState<DataTableProblem[]>([])

  useEffect(() => {
    fetcherGql(GET_PROBLEMS, {
      groupId: 1,
      cursor: 1,
      take: 10,
      input: {
        difficulty: ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'],
        languages: ['C', 'Cpp', 'Java', 'Python3']
      }
    }).then((data) => {
      const transformedData = data.getProblems.map(
        (problem: {
          id: string
          title: string
          updateTime: string
          difficulty: string
          submissionCount: number
          acceptedRate: number
          languages: string[]
          problemTag: { id: string; tag: Tag }[]
        }) => ({
          ...problem,
          id: Number(problem.id),
          problemTag: problem.problemTag.map(
            (tag: { id: string; tag: Tag }) => ({
              ...tag,
              id: Number(tag.id),
              tag: {
                ...tag.tag,
                id: Number(tag.tag.id)
              }
            })
          )
        })
      )
      setProblems(transformedData)
    })
  }, [])

  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <div className="flex text-4xl font-bold">Problem List</div>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        <Link href="/admin/problem/create">
          <Button className="rounded-md bg-blue-500 px-3 py-[6px] text-white hover:bg-blue-700">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>
      <DataTableAdmin columns={columns} data={problems} />
    </div>
  )
}
