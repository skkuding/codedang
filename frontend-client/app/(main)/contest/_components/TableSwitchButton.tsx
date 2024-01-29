'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function TableSwitchButton() {
  const searchParam = useSearchParams()
  const registered = searchParam.get('registered')

  return (
    <div className="flex gap-3">
      <Link
        href="/contest?registered=true"
        className={cn(
          'w-fit text-xl font-bold text-gray-700 md:text-2xl',
          registered ? 'text-blue-500' : ''
        )}
        scroll={false}
      >
        Registered
      </Link>
      <Link
        href="/contest"
        className={cn(
          'w-fit text-xl font-bold text-gray-700 md:text-2xl',
          !registered ? 'text-blue-500' : ''
        )}
        scroll={false}
      >
        Finished
      </Link>
    </div>
  )
}
