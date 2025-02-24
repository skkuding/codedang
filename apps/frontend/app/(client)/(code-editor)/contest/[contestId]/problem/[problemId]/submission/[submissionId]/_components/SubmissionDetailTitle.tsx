'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import type { ContestSubmission } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'

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

  const Alphabet = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ]

  const title =
    problemId > 0 && problemId <= 27
      ? `${Alphabet[problemId - 1]}.${data}`
      : '!'
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
