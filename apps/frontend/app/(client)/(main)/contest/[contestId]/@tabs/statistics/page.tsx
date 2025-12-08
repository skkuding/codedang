import { Button } from '@/components/shadcn/button'
import { Card, CardContent } from '@/components/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
import { auth } from '@/libs/auth'
import { cn } from '@/libs/utils'
import statisticsChart from '@/public/captures/statistics-chart.gif'
import statisticsLeaderboard from '@/public/captures/statistics-leaderboard.gif'
import statisticsSubmissions from '@/public/captures/statistics-submissions.gif'
import Image from 'next/image'
import Link from 'next/link'
import { LuArrowRight } from 'react-icons/lu'
import { getContest } from '../leaderboard/_libs/apis/getContest'
import { getContestLeaderboard } from '../leaderboard/_libs/apis/getContestLeaderboard'
import { ProblemStatisticsPage } from './_components/ProblemStatistics'
import { RealtimeLearBoardPage } from './_components/RealtimeLeaderBoard'
import { UserAnalysisPage } from './_components/UserAnalysis'

interface ContestStatisticsProps {
  params: Promise<{
    contestId: string
  }>
}

export default async function ContestStatistics(props: ContestStatisticsProps) {
  const { contestId } = await props.params

  // If contest is not finished or has frozen records, throw error to show error.tsx
  const [contestLeaderboard, contest] = await Promise.all([
    getContestLeaderboard({
      contestId: parseInt(contestId)
    }),
    getContest({ contestId: parseInt(contestId) })
  ])
  if (new Date(contest.endTime) > new Date()) {
    throw new Error('Contest not finished')
  }

  // TODO: should change to check if the contest is frozen, not problem records (inefficient implementation)
  const hasFrozenRecords = contestLeaderboard.leaderboard.some((user) =>
    user.problemRecords.some((record) => record.isFrozen)
  )

  if (hasFrozenRecords) {
    throw new Error('Leaderboard has frozen records')
  }
  return (
    <Tabs defaultValue="leaderboard">
      <div className="mt-[80px] flex w-[1440px] justify-between px-[116px]">
        <p className="text-2xl font-semibold tracking-[-0.03em]">STATISTICS</p>
        <TabsList>
          <TabsTrigger value="leaderboard">Realtime Leaderboard</TabsTrigger>
          <TabsTrigger value="user-analysis">User Analysis</TabsTrigger>
          <TabsTrigger value="problem-statistics">
            Problem Statistics
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="w-[1440px] px-[116px]">
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
