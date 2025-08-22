import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { fetcherWithAuth } from '@/libs/utils'
import type { ProblemDataTop } from '@/types/type'
import { Suspense } from 'react'
import { CreateQnaTextArea } from './_components/CreateQnaTextArea'
import { ReplyQnaArea } from './_components/ReplyQnaArea'

export default async function QnaPage(props: {
  params: Promise<{ problemId: string; contestId: string }>
}) {
  const { problemId, contestId } = await props.params
  const problemData: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json()
  const findproblem = problemData.data.find(
    (problem) => problem.id === Number(problemId)
  )
  const problemorder = findproblem ? findproblem.order : null

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense>
        <div className="flex flex-col">
          <CreateQnaTextArea
            problemOrder={problemorder}
            contestId={Number(contestId)}
          />
          <hr className="border-4 border-[#121728]" />
          <ReplyQnaArea
            contestId={Number(contestId)}
            problemId={Number(problemId)}
          />
        </div>
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
