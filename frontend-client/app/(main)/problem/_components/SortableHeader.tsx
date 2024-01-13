'use client'

import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import UpAndDownButton from './UpandDownButton'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export default function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div
      onClick={() => {
        column.getIsSorted() === false && column.toggleSorting(false)
        column.getIsSorted() === 'asc' && column.toggleSorting(true)
        column.getIsSorted() === 'desc' && column.clearSorting()
      }}
      className={cn(
        className,
        'flex cursor-pointer flex-row items-center justify-center'
      )}
    >
      <p>{title} </p>

      <UpAndDownButton state={column.getIsSorted()} />
    </div>
  )
}
