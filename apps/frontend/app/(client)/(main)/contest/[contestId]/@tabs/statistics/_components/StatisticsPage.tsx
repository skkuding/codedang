'use client'

import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { useState } from 'react'
import { ProblemStatisticsPage } from './ProblemStatistics'
import { RealtimeLearBoardPage } from './RealtimeLeaderBoard'
import { UserAnalysisPage } from './UserAnalysis'

export function StatisticsPage() {
  const [tab, setTab] = useState('leaderboard')
  const [selectUser, setSelectUser] = useState<boolean>(false)
  console.log('selectUser', selectUser)
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
                checked={selectUser}
                onCheckedChange={(checked) => setSelectUser(checked)}
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
          <RealtimeLearBoardPage />
        </TabsContent>
        <TabsContent value="user-analysis">
          <UserAnalysisPage />
        </TabsContent>
        <TabsContent value="problem-statistics">
          <ErrorBoundary fallback="Failed to load page.">
            <Suspense fallback={<ProblemStatisticsSkeleton />}>
              <ProblemStatisticsPage />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function ProblemStatisticsSkeleton() {
  return (
    <div className="flex animate-pulse gap-7">
      <div className="h-25 w-[276px] shrink-0 rounded-2xl bg-gray-100" />
      <div className="w-full">
        <div className="mb-4 h-7 w-48 rounded-xl bg-gray-200" />
        <div className="mb-3 flex h-[98px] gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="mb-5 flex h-[188px] gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="flex h-[338px] gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="w-1/2 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
