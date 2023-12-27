import type { ContestStatus, Level } from '@/types/type'

const variants = {
  ongoing: 'bg-primary',
  upcoming: 'bg-secondary',
  finished: 'bg-gray-500',
  Level1: 'bg-[#76C9ED]',
  Level2: 'bg-[#83F479]',
  Level3: 'bg-[#FBEB5D]',
  Level4: 'bg-[#FFA563]',
  Level5: 'bg-[#FF685E]'
}

interface Props {
  badge: ContestStatus | Level
}

export default function Badge({ badge }: Props) {
  return (
    <div className="inline-flex items-center gap-3 rounded-3xl bg-white px-3 py-1">
      <div className={`h-3 w-3 rounded-full ${variants[badge]}`}></div>
      <div className="text-gray-500">{badge}</div>
    </div>
  )
}
