'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ParticipantTableByProblem } from './_components/ParticipantTableByProblem'
import { ParticipantTableOverall } from './_components/ParticipantTableOverall'

export default function Assessment() {
  const { t } = useTranslate()
  const [tab, setTab] = useState('overall')
  const toastShownRef = useRef(false)

  const handleNoProblemsFound = () => {
    if (!toastShownRef.current) {
      toast.error(t('no_imported_problems_found'))
      toastShownRef.current = true
    }
    setTab('overall')
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overall">{t('overall_button')}</TabsTrigger>
        <TabsTrigger value="by-problem">{t('by_problem_button')}</TabsTrigger>
      </TabsList>

      <TabsContent value="overall">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense
            fallback={
              <div className="flex flex-col gap-6">
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-[500px] w-full" />
              </div>
            }
          >
            <ParticipantTableOverall />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="by-problem">
        <ErrorBoundary
          fallback={FetchErrorFallback}
          onError={handleNoProblemsFound}
        >
          <Suspense
            fallback={
              <div className="flex flex-col gap-6">
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-[500px] w-full" />
              </div>
            }
          >
            <ParticipantTableByProblem />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  )
}
