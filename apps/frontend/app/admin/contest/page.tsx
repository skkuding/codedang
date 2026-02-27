import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { ContestTable, ContestTableFallback } from './_components/ContestTable'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-[46px] py-20">
      <div className="flex justify-between">
        <div>
          <p className="text-head2_b_32">CONTEST LIST</p>
          <p className="text-body3_r_16 text-[#787E80]">
            Here&apos;s a contest list you made
          </p>
        </div>
        <Button variant="default" className="w-[120px]" asChild>
          <Link href="/admin/contest/create">
            <HiMiniPlusCircle className="mr-2 h-5 w-5" />
            <span className="text-lg">Create</span>
          </Link>
        </Button>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ContestTableFallback />}>
          <ContestTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
