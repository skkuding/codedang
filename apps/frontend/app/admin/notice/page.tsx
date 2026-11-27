import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import {
  NoticeDataTable,
  NoticeDataTableFallback
} from './_components/NoticeDataTable'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">NOTICE LIST</h1>
        <Link href="/admin/notice/create">
          <Button size="middle">
            <HiMiniPlusCircle className="size-5" />
            <span>CREATE</span>
          </Button>
        </Link>
      </div>
      <h1 className="text-lg font-normal text-gray-500">
        Here’s a Notice list you made
      </h1>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<NoticeDataTableFallback />}>
          <NoticeDataTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
