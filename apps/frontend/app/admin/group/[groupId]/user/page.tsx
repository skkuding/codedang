import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import { Suspense } from 'react'
import {
  GroupUserTable,
  GroupUserTableFallback
} from './_components/GroupUserTable'

export const dynamic = 'force-dynamic'

export default function User({ params }: { params: { groupId: string } }) {
  const { groupId } = params
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">User List</h1>
        <Button variant="default">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<GroupUserTableFallback />}>
          <GroupUserTable groupId={groupId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
