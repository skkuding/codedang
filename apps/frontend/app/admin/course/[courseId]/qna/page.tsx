import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
//import { Toggle } from '@/components/shadcn/toggle'
import {
  AssignmentTable,
  AssignmentTableFallback
} from '../../_components/AssignmentTable'
import { CourseQnaAnsweredTab } from '../_components/CourseQnaAnsweredTab'

//임시로 assignmentTable 사용, 추후 QnA Table로 교체 필요

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="gap-15 flex flex-col items-start">
        <div className="flex flex-col items-start gap-[6px] self-stretch">
          <div className="flex w-full items-start gap-5">
            <span className="flex flex-1 text-[32px] font-bold">
              Question & Answer
            </span>
          </div>
          <span className="text-color-neutral-70 text-[16px]">
            Assignment와 Exercise 문제와 관련된 질문과 답변을 제공합니다.
          </span>
        </div>
        <div className="flex flex-col items-start gap-[30ox] self-stretch">
          <span className="text-[26px] font-semibold">Questions</span>
        </div>
      </div>

      <div className="flex w-full items-start justify-between">
        <CourseQnaAnsweredTab />
        <div className="bg-color-commmon-100 text-color-neutral-90 w-[340px] rounded-full border border-[#D8D8D8] px-3 py-[12px]">
          <span>...Search</span>
        </div>
      </div>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <AssignmentTable groupId={courseId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
