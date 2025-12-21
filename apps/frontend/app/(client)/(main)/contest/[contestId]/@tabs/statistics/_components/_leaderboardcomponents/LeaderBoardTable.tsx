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

  return (
    <Table className="mt-15 !border-separate border-spacing-2">
      <TableHeader className="w-full border-b-0">
        <TableRow className="h-10">
          <TableHead className="bg-color-neutral-99 w-15 rounded-full text-base font-medium">
            Mark
          </TableHead>
          <TableHead className="bg-color-neutral-99 w-15 rounded-full text-base font-medium">
            Rank
          </TableHead>
          <TableHead className="bg-color-neutral-99 w-55 rounded-full text-base font-medium">
            Participants
          </TableHead>
          <TableHead className="bg-color-neutral-99 w-30 rounded-full text-base font-medium">
            Penalty
          </TableHead>
          {problems.contestProblem.map((problem) => (
            <TableHead
              key={problem.problemId}
              className="bg-color-neutral-99 rounded-full text-center text-base font-medium"
            >
              {problem.problemOrder}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user.userId}>
            <TableCell className="border-0">
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={isSelected(user.userId.toString())}
                onCheckedChange={() => toggleUser(user.userId.toString())}
                aria-label="Select row"
                className="flex translate-y-[2px] justify-self-center"
              />
            </TableCell>
            <TableCell className="border-0 text-center">
              {user.userRank}
            </TableCell>
            <TableCell className="border-0">{user.userName}</TableCell>
            <TableCell className="border-0 text-center">
              - {user.totalPenalty}
            </TableCell>
            {problems.contestProblem.map((problem) => {
              const detail = user.problemDetails[problem.problemId.toString()]
              const { attempts, penalty, judgeResult } = detail
              if (judgeResult === 'NoAttempt') {
                return (
                  <TableCell
                    key={problem.problemId}
                    className="border-0 text-center"
                  >
                    -
                  </TableCell>
                )
              }
              return (
                <TableCell
                  key={problem.problemId}
                  className="border-0 text-center text-sm"
                >
                  {judgeResult === 'Accepted' ? (
                    <div> - {penalty}</div>
                  ) : (
                    <div> Wrong</div>
                  )}
                  <div>{attempts}</div>
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
