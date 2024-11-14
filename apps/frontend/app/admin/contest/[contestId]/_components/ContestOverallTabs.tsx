import {
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/contest/queries'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CSVLink } from 'react-csv'

interface ScoreSummary {
  realName: string
  studentId: string
  userContestScore: number
  contestPerfectScore: number
  submittedProblemCount: number
  totalProblemCount: number
  problemScores: { problemId: number; score: number; maxScore: number }[]
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

  const {
    data: scoreData,
    loading: loadingScores,
    error: errorScores
  } = useQuery<{ getContestScoreSummaries: ScoreSummary[] }>(
    GET_CONTEST_SCORE_SUMMARIES,
    {
      variables: { contestId: id, take: 300 },
      skip: !contestId
    }
  )

  const { loading: loadingSubmissions, error: errorSubmissions } = useQuery<{
    getContestSubmissionSummaryByUserId: { submissions: SubmissionSummary[] }
  }>(GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { contestId: id, userId, take: 300 },
    skip: !contestId || !userId
  })

  if (loadingScores || loadingSubmissions) return <p>Loading...</p>
  if (errorScores) return <p>Error: {errorScores.message}</p>
  if (errorSubmissions) return <p>Error: {errorSubmissions.message}</p>

  // 전체 사용자의 문제 ID 집합을 추출하여 고유한 문제 목록 생성
  const uniqueProblems = Array.from(
    new Set(
      scoreData?.getContestScoreSummaries.flatMap((user) =>
        user.problemScores.map((score) => score.problemId)
      ) || []
    )
  )

  // 고유한 문제 목록을 기반으로 문제 헤더 생성
  const problemHeaders = uniqueProblems.flatMap((problemId, index) => [
    {
      label: `문제 ${index + 1} 최대 점수`,
      key: `problems[${index}].maxScore`
    },
    {
      label: `문제 ${index + 1} 획득 점수`,
      key: `problems[${index}].score`
    }
  ])

  const headers = [
    { label: '이름', key: 'realName' },
    { label: '학번', key: 'studentId' },
    { label: '점수 비율', key: 'scoreRatio' },
    { label: '제출 여부', key: 'problemRatio' },
    ...problemHeaders
  ]

  const csvData =
    scoreData?.getContestScoreSummaries.map((user) => {
      const userProblemScores = uniqueProblems.map((problemId) => {
        const scoreData = user.problemScores.find(
          (ps) => ps.problemId === problemId
        )

        return {
          maxScore: scoreData ? scoreData.maxScore : 0,
          score: scoreData ? scoreData.score : 0
        }
      })

      return {
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
    <span className="flex w-max gap-1 rounded-lg bg-slate-200 p-1">
      <Link
        href={`/admin/contest/${id}`}
        className={cn(
          'rounded-md px-3 py-1.5 text-lg font-semibold',
          isCurrentTab('') && 'text-primary bg-white font-bold'
        )}
      >
        Participant
      </Link>
      <CSVLink
        data={csvData}
        headers={headers}
        filename={`contest-${id}-participants.csv`}
        className="text-primary rounded-md bg-white px-3 py-1.5 text-lg font-bold"
      >
        Export CSV
      </CSVLink>
      <Link
        href={`/admin/contest/${id}/submission`}
        className={cn(
          'rounded-md px-3 py-1.5 text-lg font-semibold',
          isCurrentTab('submission') && 'text-primary bg-white font-bold'
        )}
      >
        All Submission
      </Link>
    </span>
  )
}
