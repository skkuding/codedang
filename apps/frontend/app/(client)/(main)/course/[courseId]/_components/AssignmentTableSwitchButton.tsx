import { cn } from '@/libs/utils'
import Link from 'next/link'

export function AssignmentTableSwitchButton({
  showAll,
  ongoing,
  upcoming,
  finished
}: {
  showAll: boolean
  ongoing: boolean
  upcoming: boolean
  finished: boolean
}) {
  showAll = true
  return (
    <div className="flex items-center">
      <Link
        href="/contest"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          showAll
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        ALL
      </Link>
      <Link
        href="/contest"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          ongoing
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        ONGOING
      </Link>
      <Link
        href="/contest"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          upcoming
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : 'border-[#333333]/30'
        )}
        scroll={false}
      >
        UPCOMING
      </Link>
      <Link
        href="/contest"
        className={cn(
          'w-fit px-14 pb-2 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          finished
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
