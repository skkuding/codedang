import { Button } from '@/components/ui/button'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { ContestTable, ContestTableFallback } from './_components/ContestTable'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">Contest List</p>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        <Button variant="default" asChild>
          <Link href="/admin/contest/create">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>
      <Suspense fallback={<ContestTableFallback />}>
        <ContestTable />
      </Suspense>
    </div>
  )
}
