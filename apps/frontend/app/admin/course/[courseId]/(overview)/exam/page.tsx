import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { NoticeTable, NoticeTableFallback } from '../../_components/NoticeTable'
import { CreateNoticeModal } from './_components/CreateNoticeModal'
import { ImportNoticeModal } from './_components/ImportNoticeModal'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <p className="text-head3_sb_28">NOTICE LIST</p>
        <div className="flex gap-2">
          <ImportNoticeModal courseId={courseId} />
          <CreateNoticeModal courseId={courseId} />
        </div>
      </div>
      <p className="text-body1_m_16 text-color-neutral-50">
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
