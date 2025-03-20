'use client'

import bronzeMedalIcon from '@/public/icons/medal-bronze.svg'
import goldMedalIcon from '@/public/icons/medal-gold.svg'
import silverMedalIcon from '@/public/icons/medal-silver.svg'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface LeaderboardRowProps {
  rank: number
  dx: number
  resizableRowSize: number
  problemPenalties: number[]
}

export function LeaderboardRow({
  rank,
  dx,
  resizableRowSize,
  problemPenalties
}: LeaderboardRowProps) {
  let isTopRanked = false

  let medalImage = null
  const medals = [goldMedalIcon, silverMedalIcon, bronzeMedalIcon]
  if (rank <= 3) {
    isTopRanked = true
    medalImage = medals[rank - 1]
  }

  return (
    <div className="relative flex flex-row">
      {/* 아래 div가 row header입니다. */}
      <div
        className="z-10 flex h-[90px] w-[272px] flex-row items-center rounded-full bg-[#FFFFFF] px-[28px]"
        style={{ boxShadow: '2px 2px 10px rgba(0,0,0,0.15)' }}
      >
        {isTopRanked ? (
          <Image src={medalImage} alt="gold medal" className="px-[2px]" />
        ) : (
          <div className="flex h-[34px] w-[34px] flex-col items-center justify-center rounded-full bg-[#C4C4C4] font-[18px] font-bold text-white">
            {rank}
          </div>
        )}
        <div className="flex flex-col justify-center pl-[18px]">
          <div className="text-[22px] font-semibold">꾸딩</div>
          <div className="flex flex-row text-[14px] text-[#737373]">
            Total Penalty /{' '}
            <div className="font-medium text-[#3581FA]">꾸딩딩</div>
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
              {problemPenalties.map((penalty, index) => {
                return index === 0 ? (
                  <th
                    className="flex h-11 w-[114px] flex-row items-center justify-center text-xl font-semibold"
                    key={index}
                  >
                    {penalty}
                  </th>
                ) : (
                  <th
                    className="flex h-11 w-[114px] flex-row items-center justify-center border-l-2 border-[#E5E5E5] text-xl font-semibold"
                    key={index}
                  >
                    {penalty}
                  </th>
                )
              })}
            </motion.tr>
          </thead>
        </table>
      </motion.div>
    </div>
  )
}
