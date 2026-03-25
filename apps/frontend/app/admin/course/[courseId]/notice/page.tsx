'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { useRouter } from 'next/navigation'
import { Suspense, use, useState } from 'react'
import { FaPen } from 'react-icons/fa6'
import { NoticeTable, NoticeTableFallback } from '../../_components/NoticeTable'
import { CreateNoticeModal } from './_components/CreateNoticeModal'
import { ImportNoticeModal } from './_components/ImportNoticeModal'

export const dynamic = 'force-dynamic'

export default function Page(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(props.params)
  const router = useRouter()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[32px] font-bold leading-[130%] tracking-[-0.03em]">
            Notice List
          </p>
          <p className="text-lg text-slate-500">
            Here&apos;s a notice list you made
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-[46px] rounded-full border border-[#3581FA] px-6 py-[10px] text-[#3581FA] hover:bg-[#3581FA]/10"
            onClick={() => setIsImportOpen(true)}
          >
            <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
              + Import
            </span>
          </Button>

          <Button
            variant="default"
            className="h-[46px] rounded-full bg-[#3581FA] px-6 py-[10px] hover:bg-[#3581FA]/90"
            onClick={() => setIsCreateOpen(true)}
          >
            <FaPen className="mr-2 h-5 w-5" />
            <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
              Create
            </span>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<NoticeTableFallback />}>
            <NoticeTable groupId={courseId} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <CreateNoticeModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        courseId={courseId}
        onSuccess={handleSuccess}
      />

      <ImportNoticeModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        courseId={courseId}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
