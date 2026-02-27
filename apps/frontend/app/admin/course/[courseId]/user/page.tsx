import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { getTranslate } from '@/tolgee/server'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'
import { InviteUserButton } from './_components/InviteUserButton'

export default async function Page() {
  const t = await getTranslate()

  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<GroupTableFallback />}>
        <div className="container mx-auto space-y-2 py-10">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold">{t('member_list')}</h1>
            <InviteUserButton />
          </div>
          <GroupTable />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
