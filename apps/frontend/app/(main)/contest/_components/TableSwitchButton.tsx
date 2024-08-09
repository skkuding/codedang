'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function TableSwitchButton() {
  const searchParam = useSearchParams()
  const registered = searchParam.get('registered')

  return (
    <div className="flex items-center">
      <Link
        href="/contest"
        className={cn(
          'w-fit p-6 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50 md:text-2xl',
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
          'w-fit p-6 text-xl font-medium text-[#333333]/30 hover:text-[#333333]/50 md:text-2xl',
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
