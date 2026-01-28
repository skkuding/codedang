import { Checkbox } from '@/components/shadcn/checkbox'
import { useSession } from '@/libs/hooks/useSession'
import { cn, convertToLetter } from '@/libs/utils'
import bronzeMedalIcon from '@/public/icons/medal-bronze.svg'
import goldMedalIcon from '@/public/icons/medal-gold.svg'
import silverMedalIcon from '@/public/icons/medal-silver.svg'
import { useUserSelectionStore } from '@/stores/selectUserStore'
import { motion } from 'framer-motion'
import Image from 'next/image'
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
  const session = useSession()

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
            {problems.data.map((problem) => (
              <div
                key={problem.id}
                className="text-color-neutral-60 flex h-full w-[80px] shrink-0 items-center justify-center text-base font-medium tracking-[-0.03em]"
              >
                {convertToLetter(problem.order)}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* body */}
      <div className="mb-22 mt-2 flex flex-col gap-2">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.userId}
            layout
            initial={{
              y: (() => {
                if (rankChanges[user.userId] === 'up') {
                  return -10
                }
                if (rankChanges[user.userId] === 'down') {
                  return 10
                }
                return 0
              })(),
              opacity: 0.9
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30
            }}
            className={cn(
              'h-18 grid items-center gap-1 rounded-full bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.03),4px_0_12px_rgba(0,0,0,0.03)]',
              session && session.user.username === user.userName
                ? 'border-primary bg-color-blue-95 border-1'
                : ''
            )}
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

            <div className="text-center text-base font-normal">
              {user.userRank}
            </div>
            <div className="flex gap-1 truncate px-5 py-5">
              {user.userRank === 1 && (
                <Image src={goldMedalIcon} alt="medal" width={15} height={20} />
              )}
              {user.userRank === 2 && (
                <Image
                  src={silverMedalIcon}
                  alt="medal"
                  width={15}
                  height={20}
                />
              )}
              {user.userRank === 3 && (
                <Image
                  src={bronzeMedalIcon}
                  alt="medal"
                  width={15}
                  height={20}
                />
              )}
              <div className="text-left text-base">{user.userName}</div>
            </div>

            <div className="text-flowkit-red text-center text-base">
              -{user.totalPenalty}
            </div>

            <div className="flex w-full items-center justify-start gap-2 p-4">
              {problems.data.map((problem) => {
                const detail = user.problemDetails[problem.id.toString()]
                const { attempts, penalty, judgeResult } = detail

                if (judgeResult === 'NoAttempt') {
                  return (
                    <div
                      key={problem.id}
                      className="flex w-[80px] shrink-0 justify-center text-sm text-neutral-400"
                    >
                      -
                    </div>
                  )
                }

                return (
                  <div
                    key={problem.id}
                    className="flex w-[80px] shrink-0 flex-col items-center text-sm"
                  >
                    {judgeResult === 'Accepted' ? (
                      <div className="text-primary text-base font-normal">
                        -{penalty}
                      </div>
                    ) : (
                      <div className="text-base font-normal tracking-[-0.03em] text-[#FF2C55]">
                        Wrong
                      </div>
                    )}
                    <div className="text-xs text-neutral-500">
                      {attempts} sub
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
