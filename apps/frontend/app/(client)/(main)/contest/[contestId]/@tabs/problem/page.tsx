import { fetcherWithAuth } from '@/libs/utils'
import { getStatusWithStartEnd } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'
import type { ContestProblem } from '@/types/type'
import type { Contest } from '@/types/type'
import { ProblemTable } from './_components/ProblemTable'

interface ContestProblemProps {
  params: Promise<{ contestId: string }>
}

export interface ContestApiResponse {
  data: ContestProblem[]
  total: number
}

export default async function ContestProblem(props: ContestProblemProps) {
  const { contestId } = await props.params
  const t = await getTranslate()
  // TODO: use `getContestProblemList` from _libs/apis folder
  const res = await fetcherWithAuth.get(`contest/${contestId}/problem`, {
    searchParams: {
      take: 20
    }
  })

  // TODO: use error boundary
  if (!res.ok) {
    const { statusCode }: { statusCode: number } = await res.json()

    const contest: Contest = await fetcherWithAuth
      .get(`contest/${contestId}`)
      .then((res) => res.json())

    const formattedStartTime = dateFormatter(
      contest.startTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const formattedEndTime = dateFormatter(
      contest.endTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const contestStatus = getStatusWithStartEnd(
      formattedStartTime,
      formattedEndTime
    )

    let displayMessage = ''

    if (statusCode === 401) {
      displayMessage = t('login_first_check_problems')
    } else {
      if (contestStatus === 'ongoing') {
        displayMessage = t('please_register_view_problem_list')
      } else {
        displayMessage = t('access_after_contest_started')
      }
    }

    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">{t('access_denied_title')}</p>
          <p className="text-gray-500">{displayMessage}</p>
        </div>
      </div>
    )
  }

  const problems: ContestApiResponse = await res.json()

  return <ProblemTable problems={problems.data} />
}
