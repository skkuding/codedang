'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Skeleton } from '@/components/shadcn/skeleton'
import { Switch } from '@/components/shadcn/switch'
import { UPDATE_ASSIGNMENT } from '@/graphql/assignment/mutations'
import {
  GET_ASSIGNMENT,
  GET_ASSIGNMENT_SCORE_SUMMARIES
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery, useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { createColumns } from './Columns'

export function ParticipantTable({
  groupId,
  assignmentId
}: {
  groupId: number
  assignmentId: number
}) {
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId,
      assignmentId
    }
  }).data?.getAssignment

  const [updateAssignment, { error }] = useMutation(UPDATE_ASSIGNMENT)

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId, take: 300 }
  })
  const summariesData = summaries.data.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId }
  })

  const problemData = problems.data.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  const [revealRawScore, setRevealRawScore] = useState(
    assignmentData?.isJudgeResultVisible
  )
  const [revealFinalScore, setRevealFinalScore] = useState(
    assignmentData?.isFinalScoreVisible
  )

  return (
    <div>
      <p className="mb-3 font-medium">
        <span className="text-primary font-bold">{summariesData.length}</span>{' '}
        Participants
      </p>
      <DataTableRoot data={summariesData} columns={createColumns(problemData)}>
        <div className="flex">
          <DataTableSearchBar columndId="realName" placeholder="Search Name" />
          <div>
            Reveal Raw Score
            <Switch
              onCheckedChange={async (checked) => {
                await updateAssignment({
                  variables: {
                    groupId,
                    input: {
                      id: assignmentId,
                      isJudgeResultVisible: checked
                    }
                  }
                })
              }}
              checked={assignmentData?.isJudgeResultVisible}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
          </div>
          <div>
            Reveal Final Score
            <Switch
              onCheckedChange={async (checked) => {
                await updateAssignment({
                  variables: {
                    groupId,
                    input: {
                      id: assignmentId,
                      isFinalScoreVisible: checked
                    }
                  }
                })
              }}
              checked={assignmentData?.isFinalScoreVisible}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </div>
        <DataTable
          getHref={(data) =>
            `/admin/course/${groupId}/grade/assignment/${assignmentId}/user/${data.id}`
          }
        />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function ParticipantTableFallback() {
  return (
    <div>
      <Skeleton className="mb-3 h-[24px] w-2/12" />
      <DataTableFallback columns={createColumns([])} />
    </div>
  )
}
