'use client'

import { convertToLetter } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { motion } from 'framer-motion'

interface LeaderboardTableHeaderProps {
  colHeaderSize: number
  dx: number
  orders: number[]
}

export function LeaderboardTableHeader({
  colHeaderSize,
  dx,
  orders
}: LeaderboardTableHeaderProps) {
  const { t } = useTranslate()
  return (
    <div className="relative flex flex-row space-x-1 pb-[22px]">
      <div className="flex h-[38px] w-[86px] items-center justify-center rounded-full bg-[#80808014] text-[#B0B0B0]">
        {t('solved_text')}
      </div>
      <div className="flex h-[38px] w-[264px] items-center justify-center rounded-full bg-[#80808014] text-[#B0B0B0]">
        {t('user_id_header')} / {t('total_penalty_header')}
      </div>
      <motion.div
        className="absolute left-[354px] flex h-[38px] flex-row items-center space-x-[14px] overflow-hidden rounded-full bg-[#80808014] pl-[30px]"
        style={{ width: `${colHeaderSize}px`, transformOrigin: 'left' }}
        animate={{ width: `${colHeaderSize}px` }}
        transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="flex flex-row space-x-[14px]"
          animate={{ x: dx }}
          transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
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
