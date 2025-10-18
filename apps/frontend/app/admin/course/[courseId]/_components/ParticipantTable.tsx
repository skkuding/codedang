'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENTS
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import excelIcon from '@/public/icons/excel.svg'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { CSVLink } from 'react-csv'
import { createColumns } from './ParticipationColumns'

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

interface ParticipantTableProps {
  isExercise?: boolean
}

export function ParticipantTable({ isExercise }: ParticipantTableProps) {
  const params = useParams()
  const courseId = Number(params.courseId)
  const assignmentId = Number(
    params[isExercise ? 'exerciseId' : 'assignmentId']
  )

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { assignmentId, groupId: courseId, take: 300 }
  })
  const summariesData = summaries.data.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId: courseId, assignmentId }
  })

  const problemColumnData = problems.data.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  // 1. GraphQL Query 호출
  const { data: assignmentData } = useQuery(GET_ASSIGNMENTS, {
    variables: { groupId: courseId, take: 100 }
  })
  const { data: problemData } = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: {
      groupId: courseId,
      assignmentId
    }
  })
  const { data: scoreData } = useQuery<{
    getAssignmentScoreSummaries: ScoreSummary[]
  }>(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: {
      groupId: courseId,
      assignmentId,
      take: 300
    }
  })

  // 2. 보조 함수
  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }

  // 3. 문제 목록 파싱 (csvData보다 먼저!)
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

  // 4. csvData 생성
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

  // 5. 과제 제목 → 파일명 생성
  const assignmentTitle = assignmentData?.getAssignments.find(
    (assignment) => assignment.id === assignmentId.toString()
  )?.title

  const fileName = assignmentTitle
    ? `${assignmentTitle.replace(/\s+/g, '_')}.csv`
    : `course-${courseId}/assignment-${assignmentId}-participants.csv`

  // 6. CSV Header 생성
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

  return (
    <div>
      <DataTableRoot
        data={summariesData}
        columns={createColumns(problemColumnData)}
        enablePagination={false}
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="font-semibold">
              <span className="text-primary font-bold">
                {summariesData.length}
              </span>{' '}
              Participants
            </div>
            <DataTableSearchBar
              columndId="realName"
              placeholder="Search Name"
            />
          </div>
          <CSVLink
            data={csvData}
            headers={headers}
            filename={fileName}
            className="bg-primary flex items-center gap-2 rounded-full px-[12px] py-[8px] text-lg font-semibold text-white transition-opacity hover:opacity-85"
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
            `/admin/course/${courseId}/assignment/${assignmentId}/participant/${data.id}` as const
          }
        />
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
