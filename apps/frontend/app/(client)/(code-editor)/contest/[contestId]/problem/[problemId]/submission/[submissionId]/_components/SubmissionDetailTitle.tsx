'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import type { ContestSubmission } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
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

  const { data } = useSuspenseQuery({
    queryKey: ['submission title', contestId],
    queryFn: () => fetchContestSubmissionTitle(contestId)
  })

  const title =
    problemId > 0 && problemId <= 27
      ? `${ALPHABET[problemId - 1]}.${data}`
      : '!'
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
