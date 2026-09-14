import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  NoticeTable,
  NoticeTableFallback
} from '../../../_components/NoticeTable'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params

  return (
    <div className="container mx-auto">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<NoticeTableFallback />}>
          <NoticeTable groupId={courseId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
