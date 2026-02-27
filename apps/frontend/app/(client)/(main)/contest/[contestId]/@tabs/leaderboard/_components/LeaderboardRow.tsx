'use client'

import bronzeMedalIcon from '@/public/icons/medal-bronze.svg'
import goldMedalIcon from '@/public/icons/medal-gold.svg'
import silverMedalIcon from '@/public/icons/medal-silver.svg'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ProblemRecordInContestLeaderboard } from '../_libs/apis/getContestLeaderboard'

interface LeaderboardRowProps {
  username: string
  totalPenalty: number
  rank: number
  dx: number
  resizableRowSize: number
  problemRecords: ProblemRecordInContestLeaderboard[]
  search: boolean
}

export function LeaderboardRow({
  username,
  totalPenalty,
  rank,
  dx,
  resizableRowSize,
  problemRecords,
  search
}: LeaderboardRowProps) {
  const medals = [goldMedalIcon, silverMedalIcon, bronzeMedalIcon]
  const isTopRanked = rank <= 3
  const medalImage = isTopRanked ? medals[rank - 1] : null
  if (!search) {
    return (
      <div className="relative flex flex-row">
        {/* 아래 div가 row header입니다. */}
        <div
          className="z-10 flex h-[90px] w-[272px] flex-row items-center rounded-full bg-[#FFFFFF] px-[28px]"
          style={{ boxShadow: '2px 2px 10px rgba(0,0,0,0.15)' }}
        >
          {isTopRanked ? (
            <Image src={medalImage} alt="medal" className="px-[2px]" />
          ) : (
            <div className="flex h-[34px] w-[34px] flex-col items-center justify-center rounded-full bg-[#C4C4C4] font-[18px] font-bold text-white">
              {rank}
            </div>
          )}
          <div className="flex flex-col justify-center pl-[18px]">
            <div className="text-[22px] font-semibold">{username}</div>
            <div className="text-body4_r_14 flex flex-row text-[#737373]">
              Total Penalty /{' '}
              <div className="text-body1_m_16 text-[#3581FA]">
                {totalPenalty}
              </div>
            </div>
          </div>
        </div>
        {/* 아래 div는 가로 스크롤이 되는 row body입니다. */}
        <motion.div
          className="absolute h-[90px] overflow-hidden rounded-full border-2 border-[#E5E5E5] bg-[#FFFFFF] pl-[295px]"
          style={{ width: `${resizableRowSize}px` }}
          animate={{ width: `${resizableRowSize}px` }}
          transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
        >
          <table className="text-center">
            <thead>
              <motion.tr
                className="flex h-[90px] flex-row items-center"
                animate={{ x: dx }}
                transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
              >
                {problemRecords.map((problem, index) => {
                  if (problem.isFrozen) {
                    return (
                      <th
                        key={index}
                        className={`flex h-11 w-[114px] flex-row items-center justify-center text-xl font-semibold ${
                          index !== 0 ? 'border-l-2 border-[#DCE3E5]' : ''
                        }`}
                      >
                        <LeaderboardPenalty problem={problem} />
                      </th>
                    )
                  }
                  return index === 0 ? (
                    <Tooltip.Root key={index}>
                      <Tooltip.Trigger asChild>
                        <th
                          className="text-title1_sb_20 flex h-11 w-[114px] flex-row items-center justify-center"
                          key={index}
                        >
                          <LeaderboardPenalty problem={problem} />
                        </th>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={10} asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="flex h-[38px] w-[88px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-lg text-white"
                          >
                            <div>{`${problem.submissionCount} sub`}</div>
                            <div className="border-t-10 absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-[#3581FA]" />
                          </motion.div>
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ) : (
                    <Tooltip.Root key={index}>
                      <Tooltip.Trigger asChild>
                        <th
                          className="text-title1_sb_20 flex h-11 w-[114px] flex-row items-center justify-center border-l-2 border-[#E5E5E5]"
                          key={index}
                        >
                          <LeaderboardPenalty problem={problem} />
                        </th>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={10} asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="flex h-[38px] w-[88px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-lg text-white"
                          >
                            <div>{`${problem.submissionCount} sub`}</div>
                            <div className="border-t-10 absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-[#3581FA]" />
                          </motion.div>
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  )
                })}
              </motion.tr>
            </thead>
          </table>
        </motion.div>
      </div>
    )
  } else {
    return (
      <div className="relative flex flex-row">
        {/* 아래 div가 row header입니다. */}
        <div
          className="z-10 flex h-[90px] w-[272px] flex-row items-center rounded-full bg-[#3581FA] px-[28px] text-[#FFFFFF]"
          style={{ boxShadow: '2px 2px 10px rgba(0,0,0,0.15)' }}
        >
          {isTopRanked ? (
            <Image src={medalImage} alt="medal" className="px-[2px]" />
          ) : (
            <div className="flex h-[34px] w-[34px] flex-col items-center justify-center rounded-full bg-[#FFFFFF] font-[18px] font-bold text-[#3581FA]">
              {rank}
            </div>
          )}
          <div className="flex flex-col justify-center pl-[18px]">
            <div className="text-[22px] font-semibold">{username}</div>
            <div className="text-body4_r_14 flex flex-row text-[#FFFFFF]">
              Total Penalty /{' '}
              <div className="text-body1_m_16 text-[#FFFFFF]">
                {totalPenalty}
              </div>
            </div>
          </div>
        </div>
        {/* 아래 div는 가로 스크롤이 되는 row body입니다. */}
        <motion.div
          className="absolute h-[90px] overflow-hidden rounded-full border-2 border-[#3581FA] bg-[#F2F6F7] pl-[295px]"
          style={{ width: `${resizableRowSize}px` }}
          animate={{ width: `${resizableRowSize}px` }}
          transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
        >
          <table className="text-center">
            <thead>
              <motion.tr
                className="flex h-[90px] flex-row items-center"
                animate={{ x: dx }}
                transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
              >
                {problemRecords.map((problem, index) => {
                  if (problem.isFrozen) {
                    return (
                      <th
                        key={index}
                        className={`flex h-11 w-[114px] flex-row items-center justify-center text-xl font-semibold ${
                          index !== 0 ? 'border-l-2 border-[#DCE3E5]' : ''
                        }`}
                      >
                        <LeaderboardPenalty problem={problem} />
                      </th>
                    )
                  }

                  return index === 0 ? (
                    <Tooltip.Root key={index}>
                      <Tooltip.Trigger asChild>
                        <th
                          className="text-title1_sb_20 flex h-11 w-[114px] flex-row items-center justify-center"
                          key={index}
                        >
                          <LeaderboardPenalty problem={problem} />
                        </th>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={10} asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="flex h-[38px] w-[88px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-lg text-white"
                          >
                            <div>{`${problem.submissionCount} sub`}</div>
                            <div className="border-t-10 absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-[#3581FA]" />
                          </motion.div>
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ) : (
                    <Tooltip.Root key={index}>
                      <Tooltip.Trigger asChild>
                        <th
                          className="text-title1_sb_20 flex h-11 w-[114px] flex-row items-center justify-center border-l-2 border-[#DCE3E5]"
                          key={index}
                        >
                          <LeaderboardPenalty problem={problem} />
                        </th>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={10} asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="flex h-[38px] w-[88px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-lg text-white"
                          >
                            <div>{`${problem.submissionCount} sub`}</div>
                            <div className="border-t-10 absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-[#3581FA]" />
                          </motion.div>
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  )
                })}
              </motion.tr>
            </thead>
          </table>
        </motion.div>
      </div>
    )
  }
}

interface LeaderboardPenaltyProps {
  problem: ProblemRecordInContestLeaderboard
}
function LeaderboardPenalty({ problem }: LeaderboardPenaltyProps) {
  const penalty = problem.penalty
  const score = problem.score
  const isFrozen = problem.isFrozen
  const isFirstSolver = problem.isFirstSolver

  if (isFrozen) {
    return <div className="text-title1_sb_20 text-[#C4C4C4]">Frozen</div>
  } else if (score === 0) {
    return <div>-</div>
  } else if (isFirstSolver) {
    return <div className="text-[#3581FA]">{penalty}</div>
  } else {
    return <div>{penalty}</div>
  }
}
