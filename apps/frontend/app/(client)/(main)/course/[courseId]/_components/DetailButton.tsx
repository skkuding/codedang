'use client'

import { DialogTrigger } from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import { GradeDetailIcon } from './Icons'

interface DetailButtonProps {
  isActivated: boolean
}

export function DetailButton({ isActivated }: DetailButtonProps) {
  return (
    <DialogTrigger
      asChild
      onClick={(e) => {
        if (!isActivated) {
          e.preventDefault()
        }
        e.stopPropagation()
      }}
    >
      <div
        className={cn(
          isActivated ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
        )}
      >
        <GradeDetailIcon fill={isActivated ? '#3581FA' : '#C4C4C4'} />
      </div>
    </DialogTrigger>
  )
}
