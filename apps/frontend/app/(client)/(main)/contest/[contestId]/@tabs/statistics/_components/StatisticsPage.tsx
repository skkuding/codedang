'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
import { cn } from '@/libs/utils'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { useState } from 'react'
import { ProblemStatisticsPage } from './ProblemStatistics'
import { RealtimeLearBoardPage } from './RealtimeLeaderBoard'
import {
  ProblemStatisticsSkeletonWithSidebar,
  UserAnalysisSkeletonWithSidebar,
  RealtimeLearBoardSkeleton
} from './StatisticsSkeletons'
import { UserAnalysisPage } from './UserAnalysis'

export function StatisticsPage() {
  const [tab, setTab] = useState('leaderboard')
  const showOnlySelected = useUserSelectionStore((s) => s.showOnlySelected)
  const setShowOnlySelected = useUserSelectionStore(
    (s) => s.setShowOnlySelected
  )
  return (
    <Tabs defaultValue="leaderboard" value={tab} onValueChange={setTab}>
      <div className="mt-[80px] flex w-[1440px] justify-between px-[116px]">
        <div className="flex items-center gap-3">
          <p className="text-2xl font-semibold tracking-[-0.03em]">
            STATISTICS
          </p>
          {tab === 'leaderboard' && (
            <>
              <Separator orientation="vertical" className="h-[25px]" />
              <p className="text-color-neutral-60 text-lg font-medium tracking-[-0.03em]">
                Only select Users
              </p>
              <Switch
                checked={showOnlySelected}
                onCheckedChange={(checked) => setShowOnlySelected(checked)}
                className={cn(
                  showOnlySelected ? 'bg-primary' : '!bg-line-neutral'
                )}
              />
            </>
          )}
        </div>
        <TabsList>
          <TabsTrigger value="leaderboard">Real-Time Leaderboard</TabsTrigger>
          <TabsTrigger value="problem-statistics">
            Problem Statistics
          </TabsTrigger>
          <TabsTrigger value="user-analysis">User Analysis</TabsTrigger>
        </TabsList>
      </div>
      <div className="mt-5 w-[1440px] px-[116px]">
        <TabsContent value="leaderboard">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<RealtimeLearBoardSkeleton />}>
              <RealtimeLearBoardPage />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="user-analysis">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<UserAnalysisSkeletonWithSidebar />}>
              <UserAnalysisPage />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="problem-statistics">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<ProblemStatisticsSkeletonWithSidebar />}>
              <ProblemStatisticsPage />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </div>
    </Tabs>
  )
}
