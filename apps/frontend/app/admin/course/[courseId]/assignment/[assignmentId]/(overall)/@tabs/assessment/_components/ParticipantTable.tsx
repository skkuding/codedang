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
import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import { CSVLink } from 'react-csv'
import { toast } from 'sonner'
import { createColumns } from './Columns'

interface ParticipantTableProps {
  groupId: number
  assignmentId: number
}

export function ParticipantTable({
  groupId,
  assignmentId
}: ParticipantTableProps) {
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId,
      assignmentId
    }
  }).data?.getAssignment

  const [updateAssignment] = useMutation(UPDATE_ASSIGNMENT)

  const summaries = useQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId, take: 300 }
  })
  const summariesData = summaries.data?.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  const problems = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId }
  })

  const problemData = problems.data?.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  const [revealFinalScore, setRevealFinalScore] = useState(
    assignmentData?.isFinalScoreVisible
  )

  useEffect(() => {
    setRevealFinalScore(assignmentData?.isFinalScoreVisible)
  }, [assignmentData?.isFinalScoreVisible])

  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }

  const assignmentTitle = assignmentData?.title

  const now = dayjs()

  const isAssignmentFinished = now.isAfter(dayjs(assignmentData?.dueTime))

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
      label: `Total Score(MAX ${summaries?.data?.getAssignmentScoreSummaries[0]?.assignmentPerfectScore || 0})`,
      key: 'finalScore'
    },

    ...problemHeaders
  ]

  const csvData =
    summaries.data?.getAssignmentScoreSummaries.map((user) => {
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-4">
        <UtilityPanel
          title="Show Scores to Students"
          description="When enabled, students can view their scores for this assignment."
        >
          <Switch
            onCheckedChange={async (checked) => {
              if (!isAssignmentFinished) {
                toast.error(
                  'Score cannot be revealed before assignment due time.'
                )
                return
              }
              setRevealFinalScore(checked)
              await updateAssignment({
                variables: {
                  groupId,
                  input: {
                    id: assignmentId,
                    isFinalScoreVisible: checked
                  }
                },
                onCompleted: () => {
                  toast.success('Successfully updated')
                }
              })
            }}
            checked={revealFinalScore}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
          />
        </UtilityPanel>
        <UtilityPanel
          title="Download as a CSV"
          description="Download grading results, showing scores by student and problem"
        >
          <CSVLink
            data={csvData}
            headers={headers}
            filename={fileName}
            className="bg-primary flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Download
          </CSVLink>
        </UtilityPanel>
      </div>
      <p className="mb-3 font-medium">
        <span className="text-primary font-bold">{summariesData?.length}</span>{' '}
        Participants
      </p>
      <DataTableRoot
        data={summariesData || []}
        columns={createColumns(
          problemData || [],
          groupId,
          assignmentId,
          isAssignmentFinished,
          summaries.refetch
        )}
      >
        <DataTableSearchBar columndId="realName" placeholder="Search Name" />
        <DataTable />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function ParticipantTableFallback() {
  return (
    <div>
      <Skeleton className="mb-3 h-[24px] w-2/12" />
      <DataTableFallback columns={createColumns([], 0, 0, true, () => {})} />
    </div>
  )
}

interface UtilityPanelProps {
  children: React.ReactNode
  title: string
  description: string
}

function UtilityPanel({ children, title, description }: UtilityPanelProps) {
  return (
    <div className="flex h-24 w-full items-center justify-between rounded-xl border border-[#D8D8D8] bg-white px-5 py-4">
      <div className="text-[#737373]">
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-base">{description}</p>
      </div>
      {children}
    </div>
  )
}
