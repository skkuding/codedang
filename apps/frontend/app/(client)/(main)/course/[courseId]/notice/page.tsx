import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import {
  CourseNoticeTable,
  CourseNoticeTableFallback
} from '../_components/CourseNoticeTable'

interface NoticeProps {
  params: Promise<{ courseId: string }>
}

export default async function Notice(props: NoticeProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 mt-20 w-full px-10 lg:mt-20">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<CourseNoticeTableFallback />}>
          <CourseNoticeTable courseId={Number(courseId)} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
