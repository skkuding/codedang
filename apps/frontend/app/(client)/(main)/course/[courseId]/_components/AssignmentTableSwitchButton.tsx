import { cn } from '@/libs/utils'
import Link from 'next/link'

export function AssignmentTableSwitchButton({ type }: { type: string }) {
  return (
    <div className="flex items-center">
      <Link
        href="/course/null/assignment?type=showAll"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          type !== 'ongoing' && type !== 'upcoming' && type !== 'finished'
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        ALL
      </Link>
      <Link
        href="/course/null/assignment?type=ongoing"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          type === 'ongoing'
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        ONGOING
      </Link>
      <Link
        href="/course/null/assignment?type=upcoming"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          type === 'upcoming'
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        UPCOMING
      </Link>
      <Link
        href="/course/null/assignment?type=finished"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          type === 'finished'
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        FINISHED
      </Link>
    </div>
  )
}
