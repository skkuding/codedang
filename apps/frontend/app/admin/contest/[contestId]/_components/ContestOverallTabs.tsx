'use client'

import {
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER,
  GET_CONTESTS
} from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import excelIcon from '@/public/icons/excel.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CSVLink } from 'react-csv'

interface ScoreSummary {
  username: string
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

export function ContestOverallTabs({ contestId }: { contestId: string }) {
  const id = parseInt(contestId, 10)
  const pathname = usePathname()

  const { data: userData } = useQuery<{
    getUserIdByContest: { userId: number }
  }>(GET_CONTEST_SCORE_SUMMARIES, {
    variables: { contestId: id },
    skip: !contestId
  })

  const userId = userData?.getUserIdByContest?.userId

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
    variables: { take: 100 },
    skip: !contestId
  })

  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId: id },
    skip: !contestId
  })

  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }
  const contestTitle = contestData?.getContests.find(
    (contest) => contest.id === contestId
  )?.title

  const fileName = contestTitle
    ? `${contestTitle.replace(/\s+/g, '_')}.csv`
    : `contest-${id}-participants.csv`

  const problemList =
    problemData?.getContestProblems
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
      label: `제출 문제 수(총 ${scoreData?.getContestScoreSummaries[0]?.totalProblemCount || 0})`,
      key: 'problemRatio'
    },
    {
      label: `총 획득 점수(만점 ${scoreData?.getContestScoreSummaries[0]?.contestPerfectScore || 0})`,
      key: 'score'
    },

    ...problemHeaders
  ]

  const csvData =
    scoreData?.getContestScoreSummaries.map((user) => {
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
        score: formatScore(user.userContestScore),
        problems: userProblemScores
      }
    }) || []

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/admin/contest/${id}`
    }
    return pathname.startsWith(`/admin/contest/${id}/${tab}`)
  }

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
