'use client'

import {
  DataTable,
  DataTableFallback,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  GET_ASSIGNMENT,
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { REJUDGE_ASSIGNMENT_PROBLEM } from '@/graphql/submission/mutations'
import { useQuery, useSuspenseQuery, useMutation } from '@apollo/client'
import { RejudgeMode } from '@generated/graphql'
import dayjs from 'dayjs'
import { useState, useEffect, useMemo } from 'react'
import { CSVLink } from 'react-csv'
import { toast } from 'sonner'
import { createColumns } from './ColumnsByProblem'
import { ProblemSelectDropdown } from './DataTableProblemFilterSingle'

interface ParticipantTableProps {
  courseId: number
  assignmentId: number
}

export function ParticipantTableByProblem({
  courseId,
  assignmentId
}: ParticipantTableProps) {
  const [rejudge] = useMutation(REJUDGE_ASSIGNMENT_PROBLEM)
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: courseId,
      assignmentId
    }
  }).data?.getAssignment

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId: courseId, assignmentId, take: 300 }
  })
  const { refetch: refetchSummaries } = summaries
  const summariesData = summaries.data.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId: courseId, assignmentId }
  })

  const problemData = problems.data.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  )

  const handleRejudge = async () => {
    if (!selectedPid) {
      console.error('No problem selected')
      return
    }

    try {
      await rejudge({
        variables: {
          groupId: courseId,
          input: {
            assignmentId,
            problemId: selectedPid,
            mode: RejudgeMode.CreateNew
          }
        }
      })

      await Promise.all([refetchSummaries(), refetchTcResults()])
      toast.success('Rejudge successful')
    } catch (e) {
      console.error('Rejudge failed', e)
    }
  }

  useEffect(() => {
    if (problemData?.length && !selectedProblemId) {
      setSelectedProblemId(problemData[0].problemId)
    }
  }, [problemData, selectedProblemId])

  const selectedPid = selectedProblemId ?? problemData?.[0]?.problemId
  const tcResults = useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS, {
    variables: { groupId: courseId, assignmentId, problemId: selectedPid },
    fetchPolicy: 'no-cache',
    returnPartialData: false,
    errorPolicy: 'all'
  })
  const { refetch: refetchTcResults } = tcResults

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

  const now = dayjs()
  const isAssignmentFinished = now.isAfter(
    dayjs(assignmentData?.dueTime ?? assignmentData?.endTime)
  )

  const assignmentTitle = assignmentData?.title
  const problemToDownload = problemData.find((p) => p.problemId === selectedPid)
  const alphabet = String.fromCharCode(65 + (problemToDownload?.order ?? 0))
  const problemLabel = `${alphabet}.${problemToDownload?.problem.title}`
  const fileName = assignmentTitle
    ? `${assignmentTitle.replace(/\s+/g, '_')} - ${problemLabel}.csv`
    : `course-${courseId}/assignment-${assignmentId}/problem-${selectedPid}.csv`

  const headers = [
    { label: 'Student ID', key: 'studentId' },
    { label: 'Testcase', key: 'testcase' },
    { label: 'Total', key: 'total' }
  ]

  const csvData = summaries.data?.getAssignmentScoreSummaries.map((user) => {
    const userTestcases = (tcByUser.get(user.userId) ?? [])
      .map((tc) => (tc.result === 'Accepted' ? 'O' : 'X'))
      .join('')

    const totalPassed = (tcByUser.get(user.userId) ?? []).filter(
      (tc) => tc.result === 'Accepted'
    ).length
    const totalTestcases = (tcByUser.get(user.userId) ?? []).length

    return {
      studentId: user.studentId,
      testcase: userTestcases,
      total: `${totalPassed} / ${totalTestcases}`
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-4">
        <UtilityPanel
          title="Rejudge Problem"
          description="Rejudging will re-evaluate all submissions for current problem in this assignment."
        >
          <button
            onClick={handleRejudge}
            className="bg-primary flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Rejudge
          </button>
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
          courseId,
          isAssignmentFinished
        )}
        enablePagination={false}
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
