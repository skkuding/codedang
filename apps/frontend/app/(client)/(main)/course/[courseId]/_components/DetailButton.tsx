'use client'

import { DialogTrigger } from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import { GradeDetailIcon } from '../../../../../../components/Icons'

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
        <GradeDetailIcon
          className={isActivated ? 'text-[#3581FA]' : 'text-[#C4C4C4]'}
        />
      </div>
    </DialogTrigger>
  )
}
