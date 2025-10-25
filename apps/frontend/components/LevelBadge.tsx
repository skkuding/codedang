import { Badge } from '@/components/shadcn/badge'

const typeClass = {
  default:
    'items-center justify-center py-1 leading-[140%] w-[70px] px-2 text-xs font-semibold tracking-[-0.36px]',
  dark: 'items-center justify-center py-1 leading-[140%] h-[25px] w-[70px] self-center bg-[#474747] px-2 text-xs font-semibold tracking-[-0.36px] hover:bg-[#474747]',
  gray: 'items-center justify-center py-1 leading-[140%] w-[72px] bg-[#F0F0F0] text-[#737373] text-sm tracking-[-0.42px] font-medium hover:bg-[#F0F0F0]'
}

export function LevelBadge({
  type = 'default',
  level
}: {
  type?: 'default' | 'dark' | 'gray'
  level: 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'
}) {
  return (
    <Badge
      className={typeClass[type]}
      {...(type === 'default' && { variant: level })}
      {...(type === 'dark' && { textColors: level })}
    >
      Level {level.slice(-1)}
    </Badge>
  )
}
