import { QnaTable } from '@/app/admin/course/_components/QnaTable'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { AssignmentTableFallback } from '../../_components/AssignmentTable'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex flex-col items-start">
        <div className="flex flex-col items-start gap-[6px] self-stretch">
          <div className="flex w-full items-start gap-5">
            <span className="text-head3_sb_28">Question & Answer</span>
          </div>
          <span className="text-sub3_r_15 text-color-cool-neutral-70">
            Assignment와 Exercise 문제와 관련된 질문과 답변을 제공합니다.
          </span>
        </div>
      </div>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <QnaTable groupId={courseId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
