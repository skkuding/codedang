import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { NoticeTable, NoticeTableFallback } from '../../_components/NoticeTable'
import { CreateNoticeButton } from './_components/CreateNoticeButton'
import { ImportNoticeButton } from './_components/ImportNoticeButton'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params

  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <p className="text-4xl font-bold">Notice List</p>
        <div className="flex gap-[8px]">
          <ImportNoticeButton courseId={courseId} />
          <CreateNoticeButton courseId={courseId} />
        </div>
      </div>
      <p className="text-lg text-slate-500">
        Here&apos;s a notice list you made
      </p>
      <div className="mt-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<NoticeTableFallback />}>
            <NoticeTable groupId={courseId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
