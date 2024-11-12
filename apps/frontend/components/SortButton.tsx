'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FaSortDown, FaSortUp } from 'react-icons/fa'
import { Button } from './ui/button'

interface SortButtonProps {
  children: React.ReactNode
  order: string
}

export default function SortButton({ children, order }: SortButtonProps) {
  const param = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentOrder = param.get('order')
  return (
    <Button
      variant="ghost"
      onClick={() => {
        const newParam = new URLSearchParams()
        // set all searchParam to newParam
        param.forEach((value, key) => newParam.set(key, value))
        if (!currentOrder || !currentOrder.includes(order))
          newParam.set('order', `${order}-desc`)
        else if (currentOrder == `${order}-desc`)
          newParam.set('order', `${order}-asc`)
        else if (currentOrder == `${order}-asc`) newParam.delete('order')
        router.push(`${pathname}?${newParam.toString()}` as Route)
      }}
      className="items-center justify-center gap-1 md:text-base"
    >
      {children}
      <div className="text-gray-300">
        <FaSortUp
          className={cn(
            'absolute',
            currentOrder == `${order}-asc` && 'text-gray-900'
          )}
        />
        <FaSortDown
          className={cn(currentOrder == `${order}-desc` && 'text-gray-900')}
        />
      </div>
    </Button>
  )
}
