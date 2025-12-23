'use client'

import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
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
          <ProblemStatisticsPage />
        </TabsContent>
      </div>
    </Tabs>
  )
}
