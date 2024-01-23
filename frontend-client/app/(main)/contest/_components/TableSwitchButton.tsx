'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function TableSwitchButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParam = useSearchParams()
  const registered = searchParam.get('registered')

  const onClick = () => {
    const url = registered ? `${pathname}` : `${pathname + '?registered=true'}`
    router.push(url as Route, { scroll: false })
  }

  return (
    <div className="flex gap-3">
      <button
        className={cn(
          'w-fit text-xl font-bold text-gray-700 md:text-2xl',
          registered ? 'text-blue-500' : ''
        )}
        onClick={onClick}
        disabled={registered === 'true'}
      >
        Registered
      </button>
      <button
        className={cn(
          'w-fit text-xl font-bold text-gray-700 md:text-2xl',
          !registered ? 'text-blue-500' : ''
        )}
        onClick={onClick}
        disabled={!registered}
      >
        Finished
      </button>
    </div>
  )
}
