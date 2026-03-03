import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { NoticeList } from '../_components/NoticeList'

interface NoticeProps {
  params: Promise<{ courseId: string }>
}

export default async function Notice(props: NoticeProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 flex w-full flex-col px-4 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <NoticeList courseId={Number(courseId)} />
      </ErrorBoundary>
    </div>
  )
}
