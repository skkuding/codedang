'use client'

import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import UpAndDownButton from './UpandDownButton'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  name: string
}

export default function DataTableColumnHeader<TData, TValue>({
  title,
  name,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const order = useSearchParams().get('order') ?? 'default'

  const createQueryString = useCallback(
    (name: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString())
      name && value ? params.set(name, value) : params.delete(name)
      return params.toString()
    },
    [searchParams]
  )

  return (
    <div
      onClick={() => {
        let newOrder = ''
        if (order === 'default') {
          newOrder = `${name}-asc`
        } else if (order === `${name}-asc`) {
          newOrder = `${name}-desc`
        } else if (order === `${name}-desc`) {
          newOrder = ''
        }
        router.push(`?${createQueryString('order', newOrder)}`)
      }}
      className={cn(
        className,
        'hover: flex cursor-pointer flex-row items-center justify-center rounded-lg hover:bg-gray-200'
      )}
    >
      <p>{title} &nbsp; </p>
      <UpAndDownButton state={order} name={name} />
    </div>
  )
}
