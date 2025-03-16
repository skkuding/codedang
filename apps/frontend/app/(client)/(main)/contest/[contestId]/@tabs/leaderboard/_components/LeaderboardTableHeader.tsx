'use client'

import { convertToLetter } from '@/libs/utils'
import { motion } from 'framer-motion'

interface LeaderboardTableHeaderProps {
  colHeaderSize: number
  dx: number
}

export function LeaderboardTableHeader({
  colHeaderSize,
  dx
}: LeaderboardTableHeaderProps) {
  const orders = [0, 1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="relative flex flex-row space-x-1 pb-[22px]">
      <div className="flex h-[38px] w-[86px] items-center justify-center rounded-full bg-[#80808014] text-[#B0B0B0]">
        Solved
      </div>
      <div className="flex h-[38px] w-[264px] items-center justify-center rounded-full bg-[#80808014] text-[#B0B0B0]">
        User ID / Total Penalty
      </div>
      <motion.div
        className="absolute left-[354px] flex h-[38px] flex-row items-center space-x-[14px] overflow-hidden rounded-full bg-[#80808014] pl-[30px]"
        style={{ width: `${colHeaderSize}px`, transformOrigin: 'left' }}
        animate={{ width: `${colHeaderSize}px` }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        <motion.div
          className="flex flex-row space-x-[14px]"
          animate={{ x: dx }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        >
          {orders.map((order, index) => {
            return (
              <div
                key={index}
                className="flex w-[100px] flex-row justify-center text-[#B0B0B0]"
              >
                {convertToLetter(order)}
              </div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
