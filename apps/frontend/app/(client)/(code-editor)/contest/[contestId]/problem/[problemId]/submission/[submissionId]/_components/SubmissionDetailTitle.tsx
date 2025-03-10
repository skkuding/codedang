'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import type { ContestSubmission, ContestProblem } from '@/types/type'
import { useSuspenseQueries } from '@tanstack/react-query'
import { ALPHABET } from '../_libs/constants'

interface Props {
  problemId: number
  submissionId: number
  contestId: number
}

export function SubmissionDetailTitle({
  problemId,
  submissionId,
  contestId
}: Props) {
  async function fetchContestSubmissionTitle(contestId: number) {
    const res: ContestSubmission = await safeFetcherWithAuth(
      `contest/${contestId}/submission`,
      {
        searchParams: { problemId, take: 100 }
      }
    ).json()
    const problem = res.data.filter((item) => item.id === submissionId)[0]
    const problemTitle = problem
      ? problem.problem.title
      : 'Problem fetch failed'

    return problemTitle
  }

  async function fetchContestProblemById(contestId: number, problemId: number) {
    const res: ContestProblem = await safeFetcherWithAuth(
      `contest/${contestId}/problem/${problemId}`
    ).json()
    const order = res.order

    return order
  }
  const order = fetchContestProblemById(contestId, problemId)

  const [problemTitle, problemOrder] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['submission title', contestId],
        queryFn: () => fetchContestSubmissionTitle(contestId)
      },
      {
        queryKey: ['problem order', contestId, problemId],
        queryFn: () => fetchContestProblemById(contestId, problemId)
      }
    ]
  })
  const data = problemTitle.data

  const title =
    problemOrder.data >= 0 && problemOrder.data <= 27
      ? `${ALPHABET[problemOrder.data]}.${data}`
      : '!'
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
