'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'
import { InviteButton } from './_components/InviteButton'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<GroupTableFallback />}>
        <div className="container mx-auto space-y-2 py-10">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold">MEMBER LIST</h1>
            <InviteButton />
          </div>
          <GroupTable />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
