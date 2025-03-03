import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { ContestTable, ContestTableFallback } from './_components/ContestTable'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-[46px] py-20">
      <div className="flex justify-between">
        <div>
          <p className="text-[32px] font-bold">CONTEST LIST</p>
          <p className="text-base text-[#787E80]">
            Here&apos;s a list you made
          </p>
        </div>
        <Button variant="default" asChild>
          <Link href="/admin/contest/create">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
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
