'use client'

import {
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER,
  GET_ASSIGNMENTS
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import excelIcon from '@/public/icons/excel.svg'
import { useQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CSVLink } from 'react-csv'

interface ScoreSummary {
  username: string
  realName: string
  studentId: string
  userAssignmentScore: number
  assignmentPerfectScore: number
  submittedProblemCount: number
  totalProblemCount: number
  problemScores: { problemId: number; score: number; maxScore: number }[]
  major: string
}
interface SubmissionSummary {
  problemId: number
}

export function AssignmentOverallTabs({
  groupId,
  assignmentId
}: {
  groupId: number
  assignmentId: number
}) {
  const pathname = usePathname()

  const { data: userData } = useQuery<{
    getUserIdByAssignment: { userId: number }
  }>(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId }
  })

  const userId = userData?.getUserIdByAssignment?.userId

  const { data: scoreData } = useQuery<{
    getAssignmentScoreSummaries: ScoreSummary[]
  }>(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId, take: 300 }
  })

  useQuery<{
    getAssignmentSubmissionSummaryByUserId: { submissions: SubmissionSummary[] }
  }>(GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { groupId, assignmentId, userId, take: 300 }
  })

  const { data: assignmentData } = useQuery(GET_ASSIGNMENTS, {
    variables: { groupId, take: 100 }
  })

  const { data: problemData } = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId }
  })

  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }
  const assignmentTitle = assignmentData?.getAssignments.find(
    (assignment) => assignment.id === assignmentId.toString()
  )?.title

  const fileName = assignmentTitle
    ? `${assignmentTitle.replace(/\s+/g, '_')}.csv`
    : `course-${groupId}/assignment-${assignmentId}-participants.csv`

  const problemList =
    problemData?.getAssignmentProblems
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((problem) => ({
        problemId: problem.problemId,
        maxScore: problem.score,
        title: problem.problem.title,
        order: problem.order
      })) || []

  const problemHeaders = problemList.map((problem, index) => {
    const problemLabel = String.fromCharCode(65 + index)
    return {
      label: `${problemLabel}(배점 ${problem.maxScore})`,
      key: `problems[${index}].maxScore`
    }
  })

  const headers = [
    { label: '학번', key: 'studentId' },

    { label: '전공', key: 'major' },
    { label: '이름', key: 'realName' },
    { label: '아이디', key: 'username' },
    {
      label: `제출 문제 수(총 ${scoreData?.getAssignmentScoreSummaries[0]?.totalProblemCount || 0})`,
      key: 'problemRatio'
    },
    {
      label: `총 획득 점수(만점 ${scoreData?.getAssignmentScoreSummaries[0]?.assignmentPerfectScore || 0})`,
      key: 'score'
    },

    ...problemHeaders
  ]

  const csvData =
    scoreData?.getAssignmentScoreSummaries.map((user) => {
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
        major: user.major,
        realName: user.realName,
        username: user.username,
        problemRatio: user.submittedProblemCount
          ? `${user.submittedProblemCount}`
          : '-',
        score: formatScore(user.userAssignmentScore),
        problems: userProblemScores
      }
    }) || []

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/admin/course/${groupId}/assignment/${assignmentId}`
    }
    return pathname.startsWith(
      `/admin/course/${groupId}/assignment/${assignmentId}/${tab}`
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex w-max gap-1 rounded-lg bg-slate-200 p-1">
        <Link
          href={`/admin/course/${groupId}/assignment/${assignmentId}` as Route}
          className={cn(
            'rounded-md px-3 py-1.5 text-lg font-semibold',
            isCurrentTab('') && 'text-primary bg-white font-bold'
          )}
        >
          Participant
        </Link>
        <Link
          href={
            `/admin/course/${groupId}/assignment/${assignmentId}/submission` as Route
          }
          className={cn(
            'rounded-md px-3 py-1.5 text-lg font-semibold',
            isCurrentTab('submission') && 'text-primary bg-white font-bold'
          )}
        >
          All Submission
        </Link>
      </div>
      <CSVLink
        data={csvData}
        headers={headers}
        filename={fileName}
        className="flex items-center gap-2 rounded-lg bg-blue-400 px-3 py-1.5 text-lg font-semibold text-white transition-opacity hover:opacity-85"
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
  )
}
