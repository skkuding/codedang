import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { fetcherWithAuth } from '@/libs/utils'
import type { ProblemDataTop, MultipleQnaData } from '@/types/type'
import { Suspense } from 'react'
import { CreateQnaTextArea } from './_components/CreateQnaTextArea'

export default async function QnaPage(props: {
  params: Promise<{ problemId: string; contestId: string }>
}) {
  const { problemId, contestId } = await props.params
  const problemData: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json()
  const fullqnaData: MultipleQnaData[] = await fetcherWithAuth
    .get(`contest/${contestId}/qna?categories=Problem`)
    .json()
  const findproblem = problemData.data.find(
    (problem) => problem.id === Number(problemId)
  )
  // const qnaData = fullqnaData.filter(
  //   (qna) => qna.problemId === Number(problemId)
  // )
  const problemorder = findproblem ? findproblem.order : null
  console.log('fullqnaData:', fullqnaData)
  //console.log('qnaData:', qnaData)
  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense>
        <CreateQnaTextArea
          problemOrder={problemorder}
          contestId={Number(contestId)}
        />
        <hr className="border-4 border-[#121728]" />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
