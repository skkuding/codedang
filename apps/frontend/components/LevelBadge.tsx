import { Badge } from '@/components/shadcn/badge'
import { cn } from '@/libs/utils'
import type { Level } from '@/types/type'

const typeClass = {
  default: 'w-[70px] px-2 text-xs font-semibold tracking-[-0.36px]',
  dark: 'h-[25px] w-[70px] bg-[#474747] px-2 text-xs font-semibold tracking-[-0.36px] hover:bg-[#474747]',
  gray: 'w-[72px] bg-[#F0F0F0] text-[#737373] text-sm tracking-[-0.42px] font-medium hover:bg-[#F0F0F0]'
}

export function LevelBadge({
  type = 'default',
  level,
  className
}: {
  type?: 'default' | 'dark' | 'gray'
  level: Level
  className?: string
}) {
  return (
    <Badge
      className={cn(
        'items-center justify-center py-1 leading-[140%]',
        typeClass[type],
        className
      )}
      {...(type === 'default' && { variant: level })}
      {...(type === 'dark' && { textColors: level })}
    >
      Level {level.slice(-1)}
    </Badge>
  )
}
