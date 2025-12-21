import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { UserData, ContestProblemforStatistics } from './_libs/types/type'

interface LeaderBoardTableProps {
  users: UserData[]
  problems: ContestProblemforStatistics
}

export function LeaderBoardTable({ users, problems }: LeaderBoardTableProps) {
  const prevUsersRankRef = useRef<Record<string, number>>({})
  const [rankChanges, setRankChanges] = useState<Record<string, 'up' | 'down'>>(
    {}
  )
  useEffect(() => {
    const currentUsersRank: Record<string, number> = {}
    let hasRankChange = false
    const newRankChanges: Record<string, 'up' | 'down'> = {}

    users.forEach((user) => {
      currentUsersRank[user.userId] = user.userRank
      const prevRank = prevUsersRankRef.current[user.userId]
      if (prevRank !== undefined && prevRank !== user.userRank) {
        hasRankChange = true
        if (prevRank > user.userRank) {
          newRankChanges[user.userId] = 'up'
        } else if (prevRank < user.userRank) {
          newRankChanges[user.userId] = 'down'
        }
      }
    })
    if (hasRankChange && Object.keys(prevUsersRankRef.current).length > 0) {
      setRankChanges(newRankChanges)
    }
    prevUsersRankRef.current = currentUsersRank
  }, [users])
  const showOnlySelected = useUserSelectionStore((s) => s.showOnlySelected)
  const selectedUserIds = useUserSelectionStore((s) => s.selectedUserIds)
  const toggleUser = useUserSelectionStore((s) => s.toggleUser)
  const isSelected = useUserSelectionStore((s) => s.isSelected)
  const filteredUsers = showOnlySelected
    ? users.filter((user) => selectedUserIds.has(user.userId.toString()))
    : users
  const GRID_COLUMNS = `
    60px
    60px
    220px
    120px
    1fr
  `

  return (
    <div>
      {/* header */}
      <div
        className="mt-15 grid gap-1"
        style={{
          gridTemplateColumns: GRID_COLUMNS
        }}
      >
        <div className="bg-color-neutral-99 text-color-neutral-60 flex h-10 items-center justify-center rounded-full text-base font-medium tracking-[-0.03em]">
          Mark
        </div>
        <div className="bg-color-neutral-99 text-color-neutral-60 flex h-10 items-center justify-center rounded-full text-base font-medium tracking-[-0.03em]">
          Rank
        </div>
        <div className="bg-color-neutral-99 text-color-neutral-60 flex h-10 items-center justify-center rounded-full text-base font-medium tracking-[-0.03em]">
          Participant
        </div>
        <div className="bg-color-neutral-99 text-color-neutral-60 flex h-10 items-center justify-center rounded-full text-base font-medium tracking-[-0.03em]">
          Penalty
        </div>
        <div className="bg-color-neutral-99 flex h-10 items-center rounded-full px-4">
          <div className="flex w-full items-center justify-start gap-2">
            {problems.contestProblem.map((problem) => (
              <div
                key={problem.problemId}
                className="text-color-neutral-60 flex h-full w-[80px] shrink-0 items-center justify-center text-base font-medium tracking-[-0.03em]"
              >
                {problem.problemOrder}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* body */}
      <div className="mt-2 flex flex-col gap-2">
        {filteredUsers.map((user) => (
          <div
            key={user.userId}
            className="h-18 grid items-center gap-1 rounded-full bg-white"
            style={{ gridTemplateColumns: GRID_COLUMNS }}
          >
            <div className="flex justify-center">
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={isSelected(user.userId.toString())}
                onCheckedChange={() => toggleUser(user.userId.toString())}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            </div>

            <div className="text-center text-base">{user.userRank}</div>

            <div className="truncate px-5 py-5 text-left text-base">
              {user.userName}
            </div>

            <div className="text-center text-base">-{user.totalPenalty}</div>

            <div className="flex w-full items-center justify-start gap-2 p-4">
              {problems.contestProblem.map((problem) => {
                const detail = user.problemDetails[problem.problemId.toString()]
                const { attempts, penalty, judgeResult } = detail

                if (judgeResult === 'NoAttempt') {
                  return (
                    <div
                      key={problem.problemId}
                      className="flex w-[80px] shrink-0 justify-center text-sm text-neutral-400"
                    >
                      -
                    </div>
                  )
                }

                return (
                  <div
                    key={problem.problemId}
                    className="flex w-[80px] shrink-0 flex-col items-center text-sm"
                  >
                    {judgeResult === 'Accepted' ? (
                      <div>- {penalty}</div>
                    ) : (
                      <div className="text-red-500">Wrong</div>
                    )}
                    <div className="text-xs text-neutral-500">{attempts}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
