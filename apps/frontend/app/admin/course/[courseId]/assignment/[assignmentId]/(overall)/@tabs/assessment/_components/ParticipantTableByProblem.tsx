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
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { useMutation, useQuery, useSuspenseQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useState, useEffect, useMemo } from 'react'
import { CSVLink } from 'react-csv'
import { toast } from 'sonner'
import { createColumns } from './ColumnsByProblem'
import { ProblemSelectDropdown } from './DataTableProblemFilterSingle'

interface ParticipantTableProps {
  courseId: number
  groupId: number
  assignmentId: number
}

export function ParticipantTableByProblem({
  courseId,
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

  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  )

  useEffect(() => {
    if (problemData?.length && !selectedProblemId) {
      setSelectedProblemId(problemData[0].problemId)
    }
  }, [problemData, selectedProblemId])

  const selectedPid = selectedProblemId ?? problemData?.[0]?.problemId
  const tcResults = useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS, {
    variables: { groupId, assignmentId, problemId: selectedPid },
    errorPolicy: 'all'
  })

  const tcData = useMemo(
    () => tcResults.data?.getAssignmentProblemTestcaseResults ?? [],
    [tcResults.data]
  )
  const problemTestcaseData = useSuspenseQuery(GET_PROBLEM_TESTCASE, {
    variables: { id: selectedPid }
  })
  const totalTestcases =
    problemTestcaseData.data?.getProblem?.testcase?.length ?? 0

  const tcByUser = useMemo(() => {
    const m = new Map<
      number,
      { id: number; isHidden: boolean; result: string }[]
    >()
    for (const row of tcData) {
      m.set(Number(row.userId), row.result ?? [])
    }
    return m
  }, [tcData])

  const tableData = useMemo(() => {
    return summariesData.map((item) => {
      const results = tcByUser.get(Number(item.userId))
      if (results && results.length > 0) {
        return { ...item, testcaseResults: results }
      } else {
        const dummyResults = Array.from({ length: totalTestcases }).map(
          (_, i) => ({
            id: i + 1,
            isHidden: false,
            result: 'WrongAnswer'
          })
        )
        return { ...item, testcaseResults: dummyResults }
      }
    })
  }, [summariesData, tcByUser, totalTestcases])

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

  const headers = [
    { label: 'Student Id', key: 'studentId' },
    { label: 'Name', key: 'realName' },
    ...problemList.map((problem, index) => {
      const problemLabel = String.fromCharCode(65 + index)
      return {
        label: `Testcase(${problemLabel})`,
        key: `Testcase(${problemLabel})`
      }
    }),
    {
      label: `Total Score(MAX ${
        summaries?.data.getAssignmentScoreSummaries[0]
          ?.assignmentPerfectScore || 0
      })`,
      key: 'finalScore'
    }
  ]

  const csvData = summaries.data?.getAssignmentScoreSummaries.map((user) => {
    const userProblemScores = problemList.map((problem) => {
      const scoreData = user.problemScores.find(
        (ps) => ps.problemId === problem.problemId
      )
      return {
        maxScore: scoreData ? formatScore(scoreData.score) : '-',
        testcases: (tcByUser.get(user.userId) ?? [])
          .map((tc) => (tc.result === 'Accepted' ? 'O' : 'X'))
          .join('')
      }
    })

    return {
      studentId: user.studentId,
      realName: user.realName,
      finalScore: user.userAssignmentFinalScore ?? '-',
      problems: userProblemScores
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-4">
        <UtilityPanel
          title="Show Scores to Students"
          description="When enabled, students can view their scores for this assignment."
        >
          <Switch
            onCheckedChange={async (checked) => {
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
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
          />
        </UtilityPanel>
        <UtilityPanel
          title="Download as a CSV"
          description="Download grading results by students and problem to see all."
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
      <DataTableRoot
        data={tableData}
        columns={createColumns(
          problemData,
          selectedPid,
          courseId,
          assignmentId,
          groupId,
          isAssignmentFinished
        )}
      >
        <div className="mb-3 flex items-center gap-4">
          <p className="font-medium">
            <span className="text-primary font-bold">
              {summariesData.length}
            </span>{' '}
            Participants
          </p>
          <ProblemSelectDropdown
            problems={problemData.map((p) => ({
              problemId: p.problemId,
              title: p.problem.title,
              order: p.order
            }))}
            selectedProblemId={selectedProblemId}
            onSelect={(pid) => setSelectedProblemId(pid)}
          />
        </div>
        <DataTableSearchBar
          columndId="studentId"
          placeholder="Search Student Id"
        />
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
      <DataTableFallback columns={createColumns([], null, 0, 0, 0, true)} />
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
