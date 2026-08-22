import { CreateQnaTextArea } from '@/app/(client)/(code-editor)/_components/CreateQnaTextArea'
import { QuestionAnswerArea } from '@/app/(client)/(code-editor)/_components/QuestionAnswerArea'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'

export default async function QnaPage(props: {
  params: Promise<{ courseId: string; assignmentId: string; problemId: string }>
}) {
  const { courseId, assignmentId, problemId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-full flex-col bg-[#222939]">
          <CreateQnaTextArea
            courseId={Number(courseId)}
            problemId={Number(problemId)}
          />

          <hr className="border-4 border-[#121728]" />
          <QuestionAnswerArea
            courseId={Number(courseId)}
            problemId={Number(problemId)}
            assignmentId={Number(assignmentId)}
            isExercise={false}
          />
        </div>
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
