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
import excelIcon from '@/public/icons/excel.svg'
import { useMutation, useQuery, useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import { useState } from 'react'
import { CSVLink } from 'react-csv'
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

  const [updateAssignment] = useMutation(UPDATE_ASSIGNMENT)

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

  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }

  const assignmentTitle = assignmentData?.title

  const fileName = assignmentTitle
    ? `${assignmentTitle.replace(/\s+/g, '_')}.csv`
    : `course-${groupId}/assignment-${assignmentId}-participants.csv`

  const problemList =
    problemData?.map((problem) => ({
      problemId: problem.problemId,
      maxScore: problem.score,
      title: problem.problem.title,
      order: problem.order
    })) || []

  const problemHeaders = problemList.map((problem, index) => {
    const problemLabel = String.fromCharCode(65 + index)
    return {
      label: `${problemLabel}(MAX ${problem.maxScore})`,
      key: `problems[${index}].maxScore`
    }
  })

  const headers = [
    { label: 'Student Id', key: 'studentId' },
    { label: 'Name', key: 'realName' },
    {
      label: `Raw Score(MAX ${summaries?.data.getAssignmentScoreSummaries[0]?.assignmentPerfectScore || 0})`,
      key: 'rawScore'
    },
    {
      label: `Final Score(MAX ${summaries?.data.getAssignmentScoreSummaries[0]?.assignmentPerfectScore || 0})`,
      key: 'finalScore'
    },

    ...problemHeaders
  ]

  const csvData =
    summaries.data.getAssignmentScoreSummaries.map((user) => {
      const userProblemScores = problemList.map((problem) => {
        const scoreData = user.problemScores.find(
          (ps) => ps.problemId === problem.problemId
        )

        return {
          maxScore: scoreData ? formatScore(scoreData.score) : '-'
        }
      })

      return {
        studentId: user.studentId,
        realName: user.realName,
        rawScore: user.userAssignmentScore
          ? `${user.userAssignmentScore}`
          : '-',
        finalScore: user.userAssignmentFinalScore
          ? `${user.userAssignmentFinalScore}`
          : '-',
        problems: userProblemScores
      }
    }) || []

  return (
    <div>
      <p className="mb-3 font-medium">
        <span className="text-primary font-bold">{summariesData.length}</span>{' '}
        Participants
      </p>
      <DataTableRoot
        data={summariesData}
        columns={createColumns(problemData, groupId, assignmentId)}
      >
        <div className="flex items-center gap-4">
          <DataTableSearchBar columndId="realName" placeholder="Search Name" />
          <div className="flex items-center gap-2">
            Reveal Raw Score
            <Switch
              onCheckedChange={async (checked) => {
                setRevealRawScore(checked)
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
              checked={revealRawScore}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            Reveal Final Score
            <Switch
              onCheckedChange={async (checked) => {
                setRevealFinalScore(checked)
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
              checked={revealFinalScore}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <CSVLink
            data={csvData}
            headers={headers}
            filename={fileName}
            className="ml-auto flex items-center gap-2 rounded-lg bg-blue-400 px-3 py-1.5 text-lg font-semibold text-white transition-opacity hover:opacity-85"
          >
            Export
            <Image
              src={excelIcon}
              alt="Excel Icon"
              width={20}
              height={20}
              className="ml-1"
            />
          </CSVLink>
        </div>
        <DataTable
          getHref={(data) =>
            `/admin/course/${groupId}/grade/assignment/${assignmentId}/user/${data.id}/problem/1` as Route
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
      <DataTableFallback columns={createColumns([], 0, 0)} />
    </div>
  )
}
