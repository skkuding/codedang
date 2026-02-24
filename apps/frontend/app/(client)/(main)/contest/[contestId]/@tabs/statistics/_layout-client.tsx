'use client'

import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { cn } from '@/libs/utils'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import { useParams, usePathname, useRouter } from 'next/navigation'

export function StatisticsClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams<{ contestId: string }>()
  const contestId = params.contestId

  let currentTab: string
  if (pathname.includes('user-analysis')) {
    currentTab = 'user-analysis'
  } else if (pathname.includes('problem-statistics')) {
    currentTab = 'problem-statistics'
  } else {
    currentTab = 'leaderboard'
  }

  const showOnlySelected = useUserSelectionStore((s) => s.showOnlySelected)
  const setShowOnlySelected = useUserSelectionStore(
    (s) => s.setShowOnlySelected
  )

  return (
    <Tabs value={currentTab}>
      <div className="mt-[80px] flex w-[1440px] justify-between px-[116px]">
        <div className="flex items-center gap-3">
          <p className="text-2xl font-semibold tracking-[-0.03em]">
            STATISTICS
          </p>

          {currentTab === 'leaderboard' && (
            <>
              <Separator orientation="vertical" className="h-[25px]" />
              <p className="text-color-neutral-60 text-lg font-medium tracking-[-0.03em]">
                Only select Users
              </p>
              <Switch
                checked={showOnlySelected}
                onCheckedChange={setShowOnlySelected}
                className={cn(
                  showOnlySelected ? 'bg-primary' : '!bg-line-neutral'
                )}
              />
            </>
          )}
        </div>

        <TabsList>
          <TabsTrigger
            value="leaderboard"
            onClick={() => router.push(`/contest/${contestId}/statistics`)}
          >
            Real-Time Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="problem-statistics"
            onClick={() =>
              router.push(`/contest/${contestId}/statistics/problem-statistics`)
            }
          >
            Problem Statistics
          </TabsTrigger>
          <TabsTrigger
            value="user-analysis"
            onClick={() =>
              router.push(`/contest/${contestId}/statistics/user-analysis`)
            }
          >
            User Analysis
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-5 w-[1440px] px-[116px]">{children}</div>
    </Tabs>
  )
}
