import { cn } from '@/libs/utils'
import Link from 'next/link'

export function TableSwitchButton({ registered }: { registered: boolean }) {
  return (
    <div className="flex items-center">
      <Link
        href="/contest"
        className={cn(
          'w-fit p-6 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          !registered
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : ''
        )}
        scroll={false}
      >
        Finished
      </Link>
      <Link
        href="/contest?registered=true"
        className={cn(
          'w-fit p-6 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50',
          registered
            ? 'text-primary-light hover:text-primary-light border-primary-light border-b-2 font-bold'
            : ''
        )}
        scroll={false}
      >
        Registered
      </Link>
    </div>
  )
}
