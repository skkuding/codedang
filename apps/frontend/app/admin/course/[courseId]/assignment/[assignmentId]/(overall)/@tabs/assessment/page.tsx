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
import { useState, Suspense, useRef } from 'react'
import { toast } from 'sonner'
import { ParticipantTableByProblem } from './_components/ParticipantTableByProblem'
import { ParticipantTableOverall } from './_components/ParticipantTableOverall'

export default function Assessment() {
  const [tab, setTab] = useState('overall')
  const toastShownRef = useRef(false)

  const handleNoProblemsFound = () => {
    if (!toastShownRef.current) {
      toast.error('No imported problems found in this assignment.')
      toastShownRef.current = true
    }
    setTab('overall')
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overall">Overall</TabsTrigger>
        <TabsTrigger value="by-problem">By Problem</TabsTrigger>
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
