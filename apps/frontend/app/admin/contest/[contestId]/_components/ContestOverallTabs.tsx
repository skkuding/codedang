'use client'

import {
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER,
  GET_CONTESTS
} from '@/graphql/contest/queries'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CSVLink } from 'react-csv'
import { FaFileExcel } from 'react-icons/fa'

interface ScoreSummary {
  realName: string
  studentId: string
  userContestScore: number
  contestPerfectScore: number
  submittedProblemCount: number
  totalProblemCount: number
  problemScores: { problemId: number; score: number; maxScore: number }[]
  major: string
}
interface SubmissionSummary {
  problemId: number
}

export default function ContestOverallTabs({
  contestId,
  userId
}: {
  contestId: string
  userId: number
}) {
  const id = parseInt(contestId, 10)
  const pathname = usePathname()

  const { data: scoreData } = useQuery<{
    getContestScoreSummaries: ScoreSummary[]
  }>(GET_CONTEST_SCORE_SUMMARIES, {
    variables: { contestId: id, take: 300 },
    skip: !contestId
  })

  useQuery<{
    getContestSubmissionSummaryByUserId: { submissions: SubmissionSummary[] }
  }>(GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { contestId: id, userId, take: 300 },
    skip: !contestId || !userId
  })

  const { data: contestData } = useQuery(GET_CONTESTS, {
    variables: { groupId: 1, take: 100 },
    skip: !contestId
  })

  const contestTitle = contestData?.getContests.find(
    (contest) => contest.id === contestId
  )?.title

  const fileName = contestTitle
    ? `${contestTitle.replace(/\s+/g, '_')}.csv`
    : `contest-${id}-participants.csv`

  const uniqueProblems = Array.from(
    new Set(
      scoreData?.getContestScoreSummaries.flatMap((user) =>
        user.problemScores.map((score) => score.problemId)
      ) || []
    )
  )

  const problemHeaders = uniqueProblems.flatMap((problemId, index) => {
    const problemLabel = String.fromCharCode(65 + index) // 65는 'A'의 ASCII 값입니다
    return [
      {
        label: `${problemLabel}`,
        key: `problems[${index}].maxScore`
      }
    ]
  })

  const headers = [
    { label: '전공', key: 'major' },
    { label: '이름', key: 'realName' },
    { label: '학번', key: 'studentId' },
    { label: '총 획득 점수/총점', key: 'scoreRatio' },
    { label: '제출 문제 수/총 문제 수', key: 'problemRatio' },

    ...problemHeaders
  ]

  const csvData =
    scoreData?.getContestScoreSummaries.map((user) => {
      const userProblemScores = uniqueProblems.map((problemId) => {
        const scoreData = user.problemScores.find(
          (ps) => ps.problemId === problemId
        )

        return {
          maxScore: `${scoreData ? scoreData.score : 0}/${scoreData ? scoreData.maxScore : 0}`,
          score: `${scoreData ? scoreData.score : 0}/${scoreData ? scoreData.maxScore : 0}`
        }
      })

      return {
        major: user.major,
        realName: user.realName,
        studentId: user.studentId,
        scoreRatio: `${user.userContestScore}/${user.contestPerfectScore}`,
        problemRatio:
          user.submittedProblemCount === user.totalProblemCount
            ? 'Submit'
            : `${user.submittedProblemCount}/${user.totalProblemCount}`,
        problems: userProblemScores
      }
    }) || []

  const isCurrentTab = (tab: string) =>
    pathname.startsWith(`/admin/contest/${id}/${tab}`)

  return (
    <div className="flex items-center justify-between">
      <div className="flex w-max gap-1 rounded-lg bg-slate-200 p-1">
        <Link
          href={`/admin/contest/${id}`}
          className={cn(
            'rounded-md px-3 py-1.5 text-lg font-semibold',
            isCurrentTab('') && 'text-primary bg-white font-bold'
          )}
        >
          Participant
        </Link>
        <Link
          href={`/admin/contest/${id}/submission`}
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
        className="flex items-center gap-2 rounded-lg bg-blue-400 px-3 py-1.5 text-lg font-semibold text-white hover:bg-blue-200"
      >
        Export
        <FaFileExcel className="rounded-sm bg-white p-1 text-2xl text-green-600" />
      </CSVLink>
    </div>
  )
}
