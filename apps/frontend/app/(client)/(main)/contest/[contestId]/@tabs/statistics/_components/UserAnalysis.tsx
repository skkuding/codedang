import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Input } from '@/components/shadcn/input'
import { cn, fetcherWithAuth } from '@/libs/utils'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { UserAnalysisSkeleton } from './StatisticsSkeletons'
import { UserAnalysisContent } from './UserAnalysisContent'

interface UserRankInfo {
  userId: number
  username: string
  rank: number
  solved: number
  penalty: number
}

export function UserAnalysisPage() {
  const { contestId } = useParams<{ contestId: string }>()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAllUsers, setShowAllUsers] = useState(false)

  const { data: rawData } = useSuspenseQuery<UserRankInfo[]>({
    queryKey: ['statistics', contestId, 'participants'],
    queryFn: () =>
      fetcherWithAuth.get(`contest/${contestId}/statistics/users`).json()
  })

  const [curUserId, setCurUserId] = useState(
    [...rawData].sort((a, b) => a.rank - b.rank)[0].userId
  )

  const searchedUsers = rawData.filter((user) =>
    user.username.toUpperCase().includes(searchKeyword.toUpperCase())
  )

  return (
    <div className="flex gap-7 tracking-[-0.03em]">
      <div className="border-color-line-default border-1 flex h-fit w-72 flex-col gap-2 rounded-2xl px-4 pb-2 pt-5">
        <Input
          placeholder="Search"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <div>
          {searchedUsers
            .sort((a, b) => a.rank - b.rank)
            .slice(0, !showAllUsers ? 5 : undefined)
            .map((user) => (
              <div
                className={cn(
                  'flex cursor-pointer gap-3 rounded-full px-3 py-2',
                  curUserId === user.userId
                    ? 'bg-primary-light text-white'
                    : 'hover:bg-color-neutral-99'
                )}
                key={user.userId}
                onClick={() => setCurUserId(user.userId)}
              >
                <div className="w-7 flex-shrink-0 ps-1 text-left font-bold">
                  {`${user.rank}${
                    user.rank % 100 >= 11 && user.rank % 100 <= 13
                      ? 'th'
                      : ['th', 'st', 'nd', 'rd'][user.rank % 10] || 'th'
                  }`}
                </div>
                <div className="flex-1 truncate font-medium">
                  {user.username}
                </div>
                <div
                  className={cn(
                    'grid place-items-center rounded-full px-2 text-sm text-white',
                    curUserId === user.userId
                      ? 'bg-primary-strong'
                      : 'bg-primary'
                  )}
                >
                  {user.solved} solved
                </div>
              </div>
            ))}
          {searchedUsers.length > 5 && !showAllUsers && (
            <div className="place-items-center">
              <p
                onClick={() => setShowAllUsers(true)}
                className="text-color-neutral-60 hover:text-color-neutral-40 mt-1 grid cursor-pointer text-xs"
              >{`${rawData.length - 5} more users`}</p>
            </div>
          )}
        </div>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense key={curUserId} fallback={<UserAnalysisSkeleton />}>
          <UserAnalysisContent curUserId={curUserId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
