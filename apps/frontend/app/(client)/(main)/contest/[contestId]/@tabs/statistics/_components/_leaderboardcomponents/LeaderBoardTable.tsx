import { useUserSelectionStore } from '@/stores/selectUserStore'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { UserData } from './_libs/types/type'
import contestMetadataMock from './contestMetadataMock.json'
import contestProblemsMock from './contestProblemMock.json'
import LeaderboardMock from './leaderboardMock.json'
import submissionsMock from './submissionMock.json'

interface LeaderBoardTableProps {
  users: UserData[]
}

export function LeaderBoardTable({ users }: LeaderBoardTableProps) {
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
}
