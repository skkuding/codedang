'use client'

import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import { useState } from 'react'
import { ProblemStatisticsPage } from './ProblemStatistics'
import { RealtimeLearBoardPage } from './RealtimeLeaderBoard'
import { UserAnalysisPage } from './UserAnalysis'

export function StatisticsPage() {
  const [tab, setTab] = useState('leaderboard')
  const showOnlySelected = useUserSelectionStore((s) => s.showOnlySelected)
  const setShowOnlySelected = useUserSelectionStore(
    (s) => s.setShowOnlySelected
  )

  //console.log('selectUser:', showOnlySelected)
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
              />
            </>
          )}
        </div>
        <TabsList>
          <TabsTrigger value="leaderboard">Realtime Leaderboard</TabsTrigger>
          <TabsTrigger value="user-analysis">User Analysis</TabsTrigger>
          <TabsTrigger value="problem-statistics">
            Problem Statistics
          </TabsTrigger>
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
