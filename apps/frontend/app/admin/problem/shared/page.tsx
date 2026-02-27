'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense } from 'react'
import { ProblemTabs } from '../_components/ProblemTabs'
import {
  SharedProblemTable,
  SharedProblemTableFallback
} from './_components/SharedProblemTable'

export default function Page() {
  const { t } = useTranslate()
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">{t('shared_problem_list_title')}</p>
          <p className="flex text-lg text-slate-500">
            {t('shared_problem_list_description')}
          </p>
        </div>
      </div>

      <ProblemTabs />

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<SharedProblemTableFallback />}>
          <SharedProblemTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
