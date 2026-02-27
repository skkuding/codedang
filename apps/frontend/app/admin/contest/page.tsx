import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { getTranslate } from '@/tolgee/server'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { ContestTable, ContestTableFallback } from './_components/ContestTable'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const t = await getTranslate()
  return (
    <div className="container mx-auto space-y-[46px] py-20">
      <div className="flex justify-between">
        <div>
          <p className="text-[32px] font-bold">{t('contest_list_title')}</p>
          <p className="text-base text-[#787E80]">
            {t('contest_list_subtitle')}
          </p>
        </div>
        <Button variant="default" className="w-[120px]" asChild>
          <Link href="/admin/contest/create">
            <HiMiniPlusCircle className="mr-2 h-5 w-5" />
            <span className="text-lg">{t('create_button')}</span>
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
