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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mark</TableHead>
          <TableHead>Rank</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Penalty</TableHead>
          {problems.contestProblem.map((problem) => (
            <TableHead key={problem.problemId} className="text-center">
              {problem.problemOrder}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user.userId} className="hover:brightness-95">
            <TableCell>
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={isSelected(user.userId.toString())}
                onCheckedChange={() => toggleUser(user.userId.toString())}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            </TableCell>
            <TableCell className="text-center">{user.userRank}</TableCell>
            <TableCell>{user.userName}</TableCell>
            <TableCell className="text-center">- {user.totalPenalty}</TableCell>
            {problems.contestProblem.map((problem) => {
              const detail = user.problemDetails[problem.problemId.toString()]
              const { attempts, penalty, judgeResult } = detail
              if (judgeResult === 'NoAttempt') {
                return (
                  <TableCell key={problem.problemId} className="text-center">
                    -
                  </TableCell>
                )
              }
              return (
                <TableCell
                  key={problem.problemId}
                  className="text-center text-sm"
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
